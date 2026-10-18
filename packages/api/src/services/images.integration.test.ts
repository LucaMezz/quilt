import { getObject, putObject } from "@quilt/storage";
import { listKeys } from "@quilt/storage/testing";
import sharp from "sharp";
import { describe, expect } from "vitest";

import { test } from "../testing/fixtures";
import { type ImageSlot, InvalidImageError, replaceImage } from "./images";

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
    return new File([new Uint8Array(bytes)], "image.png", {
        type: "image/png",
    });
}

function slot(currentKey: string | null = null): ImageSlot {
    return { prefix: "things/1/image/", maxDimension: 64, currentKey };
}

describe("replaceImage", () => {
    test("stores the encoded image under a new key in the prefix and saves it", async ({
        storage,
    }) => {
        const saved = await replaceImage(
            storage,
            slot(),
            await pngImage(),
            async (key) => ({ key }),
        );

        expect(saved.key).toMatch(/^things\/1\/image\/[0-9a-f-]+\.webp$/);
        const object = await getObject(storage, saved.key);
        expect(object?.contentType).toBe("image/webp");
        await expect(sharp(object?.body).metadata()).resolves.toMatchObject({
            format: "webp",
        });
    });

    test("deletes the current image once the new one is saved", async ({
        storage,
    }) => {
        const first = await replaceImage(
            storage,
            slot(),
            await pngImage(),
            async (key) => key,
        );

        const second = await replaceImage(
            storage,
            slot(first),
            await pngImage(),
            async (key) => key,
        );

        await expect(listKeys(storage)).resolves.toEqual([second]);
    });

    test("leaves a current key outside the prefix alone", async ({
        storage,
    }) => {
        await putObject(
            storage,
            "things/2/image/theirs.webp",
            new Uint8Array([1]),
            "image/webp",
        );

        const saved = await replaceImage(
            storage,
            slot("things/2/image/theirs.webp"),
            await pngImage(),
            async (key) => key,
        );

        await expect(listKeys(storage)).resolves.toEqual(
            expect.arrayContaining(["things/2/image/theirs.webp", saved]),
        );
    });

    test("deletes the new image and keeps the current one when saving fails", async ({
        storage,
    }) => {
        const current = await replaceImage(
            storage,
            slot(),
            await pngImage(),
            async (key) => key,
        );

        await expect(
            replaceImage(storage, slot(current), await pngImage(), () =>
                Promise.reject(new Error("save failed")),
            ),
        ).rejects.toThrow("save failed");
        await expect(listKeys(storage)).resolves.toEqual([current]);
    });

    test("stores nothing and skips saving when the image is invalid", async ({
        storage,
    }) => {
        const svg = new File(
            ['<svg xmlns="http://www.w3.org/2000/svg"/>'],
            "image.png",
            { type: "image/png" },
        );
        let saved = false;

        await expect(
            replaceImage(storage, slot(), svg, async () => {
                saved = true;
            }),
        ).rejects.toBeInstanceOf(InvalidImageError);
        expect(saved).toBe(false);
        await expect(listKeys(storage)).resolves.toEqual([]);
    });

    test("rejects a prefix that doesn't end with a slash", async ({
        storage,
    }) => {
        await expect(
            replaceImage(
                storage,
                { ...slot(), prefix: "things/1/image" },
                await pngImage(),
                async (key) => key,
            ),
        ).rejects.toThrow('must end with "/"');
        await expect(listKeys(storage)).resolves.toEqual([]);
    });
});
