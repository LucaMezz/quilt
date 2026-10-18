import { getObject } from "@quilt/storage";
import { listKeys } from "@quilt/storage/testing";
import sharp from "sharp";
import { describe, expect } from "vitest";

import { test } from "../testing/fixtures";
import {
    getMemberOrganization,
    OrganizationForbiddenError,
    organizationLogoPrefix,
    setOrganizationLogo,
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
    await auth.api.createOrganization({
        body: { name: "Acme", slug: "acme" },
        headers: owner.headers,
    });
    const organization = await getMemberOrganization(db, owner.user.id, "acme");
    return { owner, organization };
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
