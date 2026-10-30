import { user } from "@quilt/db/schema/auth";
import { getObject } from "@quilt/storage";
import { listKeys } from "@quilt/storage/testing";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { describe, expect } from "vitest";

import { test } from "../../testing/fixtures";
import { getUser, setUserImage, userImagePrefix } from "./users";

async function pngImage() {
    const bytes = await sharp({
        create: {
            width: 32,
            height: 32,
            channels: 3,
            background: { r: 0, g: 120, b: 255 },
        },
    })
        .png()
        .toBuffer();
    return new File([new Uint8Array(bytes)], "me.png", { type: "image/png" });
}

describe("setUserImage", () => {
    test("stores the re-encoded image under the key it saves on the user", async ({
        auth,
        db,
        storage,
        signUp,
    }) => {
        const me = await signUp("me");

        const updated = await setUserImage(
            db,
            auth,
            storage,
            me.headers,
            me.user.id,
            await pngImage(),
        );

        expect(updated.image).toMatch(
            new RegExp(`^${userImagePrefix(me.user.id)}[0-9a-f-]+\\.webp$`),
        );
        await expect(getUser(db, me.user.id)).resolves.toMatchObject({
            image: updated.image,
        });
        const object = await getObject(storage, updated.image ?? "");
        expect(object?.contentType).toBe("image/webp");
    });

    test("deletes the previous image when replacing it", async ({
        auth,
        db,
        storage,
        signUp,
    }) => {
        const me = await signUp("me");
        const first = await setUserImage(
            db,
            auth,
            storage,
            me.headers,
            me.user.id,
            await pngImage(),
        );

        const second = await setUserImage(
            db,
            auth,
            storage,
            me.headers,
            me.user.id,
            await pngImage(),
        );

        expect(second.image).not.toBe(first.image);
        await expect(listKeys(storage)).resolves.toEqual([second.image]);
    });

    test("replaces an external image URL without touching storage", async ({
        auth,
        db,
        storage,
        signUp,
    }) => {
        const me = await signUp("me");
        await db
            .update(user)
            .set({ image: "https://avatars.example.com/u/1" })
            .where(eq(user.id, me.user.id));

        const updated = await setUserImage(
            db,
            auth,
            storage,
            me.headers,
            me.user.id,
            await pngImage(),
        );

        expect(updated.image).toMatch(
            new RegExp(`^${userImagePrefix(me.user.id)}`),
        );
        await expect(listKeys(storage)).resolves.toEqual([updated.image]);
    });
});
