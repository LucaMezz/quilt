import { app } from "@quilt/db/schema/app";
import { getObject } from "@quilt/storage";
import { listKeys } from "@quilt/storage/testing";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { describe, expect } from "vitest";

import { test } from "../../testing/fixtures";
import { createOrganizationAs } from "../../testing/organizations";
import { createApp, destroyApp } from "./apps";
import {
    createOrganization,
    deleteOrganization,
    getMemberOrganization,
    OrganizationForbiddenError,
    OrganizationHasAppsError,
    OrganizationNotFoundError,
    OrganizationSlugTakenError,
    organizationLogoPrefix,
    setOrganizationLogo,
    updateOrganization,
} from "./organizations";

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

const ownedOrganization = test.extend("owned", async ({ auth, db, signUp }) => {
    const owner = await signUp("owner");
    const organization = await createOrganizationAs(auth, db, owner.headers);
    return { owner, organization };
});

describe("getMemberOrganization", () => {
    test("returns the organization to a member", async ({
        db,
        createOrganization,
    }) => {
        const { organization, owner } = await createOrganization("acme");

        await expect(
            getMemberOrganization(db, owner.id, "acme"),
        ).resolves.toEqual(organization);
    });

    test("hides an organization from users who aren't members", async ({
        db,
        createOrganization,
        createUser,
    }) => {
        await createOrganization("acme");
        const outsider = await createUser("outsider");

        await expect(
            getMemberOrganization(db, outsider.id, "acme"),
        ).rejects.toBeInstanceOf(OrganizationNotFoundError);
    });

    test("only matches the organization with the given slug", async ({
        db,
        createOrganization,
    }) => {
        const { owner } = await createOrganization("acme");
        await createOrganization("globex");

        await expect(
            getMemberOrganization(db, owner.id, "globex"),
        ).rejects.toBeInstanceOf(OrganizationNotFoundError);
        await expect(
            getMemberOrganization(db, owner.id, "initech"),
        ).rejects.toBeInstanceOf(OrganizationNotFoundError);
    });
});

describe("createOrganization", () => {
    test("creates the organization with the caller as its owner", async ({
        auth,
        db,
        signUp,
    }) => {
        const caller = await signUp("caller");

        const created = await createOrganization(auth, caller.headers, {
            name: "Acme",
            slug: "acme",
        });

        expect(created).toMatchObject({ name: "Acme", slug: "acme" });
        await expect(
            getMemberOrganization(db, caller.user.id, "acme"),
        ).resolves.toMatchObject({ id: created.id });
        await expect(
            auth.api.getActiveMemberRole({
                query: { organizationId: created.id },
                headers: caller.headers,
            }),
        ).resolves.toMatchObject({ role: "owner" });
    });

    test("leaves the caller's active organization unchanged", async ({
        auth,
        signUp,
    }) => {
        const caller = await signUp("caller");
        const first = await createOrganization(auth, caller.headers, {
            name: "Acme",
            slug: "acme",
        });
        await auth.api.setActiveOrganization({
            body: { organizationId: first.id },
            headers: caller.headers,
        });

        await createOrganization(auth, caller.headers, {
            name: "Globex",
            slug: "globex",
        });

        const session = await auth.api.getSession({ headers: caller.headers });
        expect(session?.session.activeOrganizationId).toBe(first.id);
    });

    test("rejects a slug another organization already uses", async ({
        auth,
        signUp,
    }) => {
        const first = await signUp("first");
        const second = await signUp("second");
        await createOrganization(auth, first.headers, {
            name: "Acme",
            slug: "acme",
        });

        await expect(
            createOrganization(auth, second.headers, {
                name: "Acme",
                slug: "acme",
            }),
        ).rejects.toBeInstanceOf(OrganizationSlugTakenError);
    });
});

describe("updateOrganization", () => {
    ownedOrganization(
        "renames the organization",
        async ({ auth, db, owned }) => {
            const updated = await updateOrganization(
                auth,
                owned.owner.headers,
                owned.organization,
                { name: "Acme Corp" },
            );

            expect(updated).toMatchObject({ name: "Acme Corp", slug: "acme" });
            await expect(
                getMemberOrganization(db, owned.owner.user.id, "acme"),
            ).resolves.toMatchObject({ name: "Acme Corp" });
        },
    );

    ownedOrganization(
        "moves the organization to a new slug",
        async ({ auth, db, owned }) => {
            await updateOrganization(
                auth,
                owned.owner.headers,
                owned.organization,
                { slug: "acme-corp" },
            );

            await expect(
                getMemberOrganization(db, owned.owner.user.id, "acme-corp"),
            ).resolves.toMatchObject({ id: owned.organization.id });
            await expect(
                getMemberOrganization(db, owned.owner.user.id, "acme"),
            ).rejects.toBeInstanceOf(OrganizationNotFoundError);
        },
    );

    ownedOrganization(
        "rejects a slug another organization already uses",
        async ({ auth, db, owned }) => {
            await createOrganization(auth, owned.owner.headers, {
                name: "Globex",
                slug: "globex",
            });

            await expect(
                updateOrganization(
                    auth,
                    owned.owner.headers,
                    owned.organization,
                    { slug: "globex" },
                ),
            ).rejects.toBeInstanceOf(OrganizationSlugTakenError);
            await expect(
                getMemberOrganization(db, owned.owner.user.id, "acme"),
            ).resolves.toMatchObject({ id: owned.organization.id });
        },
    );

    ownedOrganization(
        "rejects members who can't update the organization",
        async ({ auth, db, signUp, owned }) => {
            const outsider = await signUp("member");
            await auth.api.addMember({
                body: {
                    userId: outsider.user.id,
                    organizationId: owned.organization.id,
                    role: "member",
                },
            });

            await expect(
                updateOrganization(auth, outsider.headers, owned.organization, {
                    name: "Hijacked",
                }),
            ).rejects.toBeInstanceOf(OrganizationForbiddenError);
            await expect(
                getMemberOrganization(db, owned.owner.user.id, "acme"),
            ).resolves.toMatchObject({ name: "Acme" });
        },
    );
});

describe("setOrganizationLogo", () => {
    ownedOrganization(
        "stores the re-encoded logo under the key it saves",
        async ({ auth, storage, owned }) => {
            const updated = await setOrganizationLogo(
                auth,
                storage,
                owned.owner.headers,
                owned.organization,
                await pngLogo(),
            );

            expect(updated.logo).toMatch(
                new RegExp(
                    `^${organizationLogoPrefix(owned.organization.id)}[0-9a-f-]+\\.webp$`,
                ),
            );
            const object = await getObject(storage, updated.logo ?? "");
            expect(object?.contentType).toBe("image/webp");
            await expect(sharp(object?.body).metadata()).resolves.toMatchObject(
                {
                    format: "webp",
                },
            );
        },
    );

    ownedOrganization(
        "deletes the previous logo when replacing it",
        async ({ auth, db, storage, owned }) => {
            await setOrganizationLogo(
                auth,
                storage,
                owned.owner.headers,
                owned.organization,
                await pngLogo(),
            );
            const withLogo = await getMemberOrganization(
                db,
                owned.owner.user.id,
                "acme",
            );

            const replaced = await setOrganizationLogo(
                auth,
                storage,
                owned.owner.headers,
                withLogo,
                await pngLogo(),
            );

            expect(replaced.logo).not.toBe(withLogo.logo);
            await expect(listKeys(storage)).resolves.toEqual([replaced.logo]);
        },
    );

    ownedOrganization(
        "rejects members who can't update the organization",
        async ({ auth, storage, signUp, owned }) => {
            const outsider = await signUp("member");
            await auth.api.addMember({
                body: {
                    userId: outsider.user.id,
                    organizationId: owned.organization.id,
                    role: "member",
                },
            });

            await expect(
                setOrganizationLogo(
                    auth,
                    storage,
                    outsider.headers,
                    owned.organization,
                    await pngLogo(),
                ),
            ).rejects.toBeInstanceOf(OrganizationForbiddenError);
            await expect(listKeys(storage)).resolves.toEqual([]);
        },
    );
});

describe("deleteOrganization", () => {
    ownedOrganization(
        "lets the owner delete an organization with no apps",
        async ({ auth, db, owned }) => {
            await deleteOrganization(
                db,
                auth,
                owned.owner.headers,
                owned.organization,
            );

            await expect(
                db.query.organization.findFirst({
                    where: { id: owned.organization.id },
                }),
            ).resolves.toBeUndefined();
            await expect(
                db.query.member.findMany({
                    where: { organizationId: owned.organization.id },
                }),
            ).resolves.toEqual([]);
        },
    );

    ownedOrganization.for(["admin", "member"] as const)(
        "rejects an %s, who can't delete the organization",
        async (role, { auth, db, signUp, owned }) => {
            const caller = await signUp(role);
            await auth.api.addMember({
                body: {
                    userId: caller.user.id,
                    organizationId: owned.organization.id,
                    role,
                },
            });

            await expect(
                deleteOrganization(
                    db,
                    auth,
                    caller.headers,
                    owned.organization,
                ),
            ).rejects.toBeInstanceOf(OrganizationForbiddenError);
            await expect(
                db.query.organization.findFirst({
                    where: { id: owned.organization.id },
                }),
            ).resolves.toMatchObject({ slug: "acme" });
        },
    );

    ownedOrganization(
        "keeps an organization that still has a live app",
        async ({ auth, db, owned }) => {
            await createApp(
                db,
                { organizationId: owned.organization.id, name: "web" },
                "example.com",
            );

            await expect(
                deleteOrganization(
                    db,
                    auth,
                    owned.owner.headers,
                    owned.organization,
                ),
            ).rejects.toBeInstanceOf(OrganizationHasAppsError);
            await expect(
                db.query.organization.findFirst({
                    where: { id: owned.organization.id },
                }),
            ).resolves.toMatchObject({ slug: "acme" });
        },
    );

    ownedOrganization(
        "keeps an organization whose app is still being destroyed",
        async ({ auth, db, owned }) => {
            const ref = { organizationId: owned.organization.id, name: "web" };
            await createApp(db, ref, "example.com");
            await destroyApp(db, ref);

            await expect(
                deleteOrganization(
                    db,
                    auth,
                    owned.owner.headers,
                    owned.organization,
                ),
            ).rejects.toBeInstanceOf(OrganizationHasAppsError);
            await expect(
                db.query.app.findMany({
                    where: { organizationId: owned.organization.id },
                }),
            ).resolves.toMatchObject([{ status: "destroying" }]);
        },
    );

    ownedOrganization(
        "purges torn-down apps along with the organization",
        async ({ auth, db, owned }) => {
            const tornDown = await createApp(
                db,
                { organizationId: owned.organization.id, name: "web" },
                "example.com",
            );
            await db
                .update(app)
                .set({ deletedAt: new Date() })
                .where(eq(app.id, tornDown.id));

            await deleteOrganization(
                db,
                auth,
                owned.owner.headers,
                owned.organization,
            );

            await expect(
                db.query.app.findMany({
                    where: { organizationId: owned.organization.id },
                }),
            ).resolves.toEqual([]);
            await expect(
                db.query.organization.findFirst({
                    where: { id: owned.organization.id },
                }),
            ).resolves.toBeUndefined();
        },
    );
});
