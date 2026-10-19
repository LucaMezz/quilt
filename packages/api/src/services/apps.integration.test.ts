import { app } from "@quilt/db/schema/app";
import { getObject } from "@quilt/storage";
import { listKeys } from "@quilt/storage/testing";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { describe, expect } from "vitest";

import { test } from "../testing/fixtures";
import {
    AppNameTakenError,
    AppNotFoundError,
    appLogoPrefix,
    createApp,
    getOwnedApp,
    listApps,
    setAppLogo,
} from "./apps";

async function pngLogo() {
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
    return new File([new Uint8Array(bytes)], "logo.png", { type: "image/png" });
}

describe("apps service", () => {
    test("lists an app after creating it", async ({
        db,
        createOrganization,
    }) => {
        const { organization } = await createOrganization();

        const created = await createApp(
            db,
            { organizationId: organization.id, name: "hello" },
            "apps.test",
        );
        const page = await listApps(db, organization.id, { limit: 10 });

        expect(created).toMatchObject({
            name: "hello",
            hostname: "hello.apps.test",
            namespace: `app-${created.id}`,
            status: "pending",
        });
        expect(page).toEqual({ items: [created], nextCursor: null });
    });

    test("rejects a name another organization's app already uses", async ({
        db,
        createOrganization,
    }) => {
        const acme = await createOrganization("acme");
        const globex = await createOrganization("globex");
        await createApp(
            db,
            { organizationId: acme.organization.id, name: "web" },
            "apps.test",
        );

        await expect(
            createApp(
                db,
                { organizationId: globex.organization.id, name: "web" },
                "apps.test",
            ),
        ).rejects.toBeInstanceOf(AppNameTakenError);
        await expect(
            listApps(db, globex.organization.id, { limit: 10 }),
        ).resolves.toEqual({ items: [], nextCursor: null });
    });
});

describe("setAppLogo", () => {
    test("stores the re-encoded logo under the key it saves on the app", async ({
        db,
        storage,
        createOrganization,
    }) => {
        const { organization } = await createOrganization();
        const created = await createApp(
            db,
            { organizationId: organization.id, name: "hello" },
            "apps.test",
        );

        const updated = await setAppLogo(db, storage, created, await pngLogo());

        expect(updated.logo).toMatch(
            new RegExp(`^${appLogoPrefix(created.id)}[0-9a-f-]+\\.webp$`),
        );
        await expect(
            getOwnedApp(db, { organizationId: organization.id, name: "hello" }),
        ).resolves.toMatchObject({ logo: updated.logo });
        const object = await getObject(storage, updated.logo ?? "");
        expect(object?.contentType).toBe("image/webp");
    });

    test("deletes the previous logo when replacing it", async ({
        db,
        storage,
        createOrganization,
    }) => {
        const { organization } = await createOrganization();
        const created = await createApp(
            db,
            { organizationId: organization.id, name: "hello" },
            "apps.test",
        );
        const first = await setAppLogo(db, storage, created, await pngLogo());

        const second = await setAppLogo(db, storage, first, await pngLogo());

        expect(second.logo).not.toBe(first.logo);
        await expect(listKeys(storage)).resolves.toEqual([second.logo]);
    });

    test("stores nothing when the app is torn down before the logo is saved", async ({
        db,
        storage,
        createOrganization,
    }) => {
        const { organization } = await createOrganization();
        const created = await createApp(
            db,
            { organizationId: organization.id, name: "hello" },
            "apps.test",
        );
        await db
            .update(app)
            .set({ deletedAt: new Date() })
            .where(eq(app.id, created.id));

        await expect(
            setAppLogo(db, storage, created, await pngLogo()),
        ).rejects.toBeInstanceOf(AppNotFoundError);
        await expect(listKeys(storage)).resolves.toEqual([]);
    });
});
