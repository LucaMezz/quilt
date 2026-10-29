import { call } from "@orpc/server";
import { describe, expect } from "vitest";

import { createApp } from "../services/apps";
import { getMemberOrganization } from "../services/organizations";
import { test } from "../testing/fixtures";
import { appRouter } from "./index";

const ownedTest = test
    .extend("owned", { auto: true }, async ({ auth, db, signUp }) => {
        const owner = await signUp("owner");
        await auth.api.createOrganization({
            body: { name: "Acme", slug: "acme" },
            headers: owner.headers,
        });
        const organization = await getMemberOrganization(
            db,
            owner.user.id,
            "acme",
        );
        return { owner, organization };
    })
    .extend(
        "join",
        ({ auth, signUp, owned }) =>
            async (role: "admin" | "member") => {
                const joined = await signUp(role);
                await auth.api.addMember({
                    body: {
                        userId: joined.user.id,
                        organizationId: owned.organization.id,
                        role,
                    },
                });
                return joined;
            },
    );

function declared(code: string, status: number) {
    return { code, status, defined: true };
}

function notAnImage() {
    return new File([new TextEncoder().encode("not an image")], "logo.png", {
        type: "image/png",
    });
}

describe("getOrganization", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.getOrganization,
                { org: "acme" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );
});

describe("createOrganization", () => {
    ownedTest(
        "responds with CONFLICT when the slug is taken",
        async ({ signUp, contextFor }) => {
            const other = await signUp("other");

            const result = call(
                appRouter.createOrganization,
                { name: "Acme", slug: "acme" },
                { context: await contextFor(other.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("CONFLICT", 409),
            );
        },
    );
});

describe("updateOrganization", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.updateOrganization,
                { org: "acme", name: "Hijacked" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with CONFLICT when the new slug is taken",
        async ({ auth, contextFor, owned }) => {
            await auth.api.createOrganization({
                body: { name: "Globex", slug: "globex" },
                headers: owned.owner.headers,
            });

            const result = call(
                appRouter.updateOrganization,
                { org: "acme", slug: "globex" },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("CONFLICT", 409),
            );
        },
    );

    ownedTest(
        "responds with FORBIDDEN to a member",
        async ({ join, contextFor }) => {
            const member = await join("member");

            const result = call(
                appRouter.updateOrganization,
                { org: "acme", name: "Hijacked" },
                { context: await contextFor(member.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("FORBIDDEN", 403),
            );
        },
    );
});

describe("setOrganizationLogo", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.setOrganizationLogo,
                { org: "acme", logo: notAnImage() },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with FORBIDDEN to a member",
        async ({ join, contextFor }) => {
            const member = await join("member");

            const result = call(
                appRouter.setOrganizationLogo,
                { org: "acme", logo: notAnImage() },
                { context: await contextFor(member.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("FORBIDDEN", 403),
            );
        },
    );

    ownedTest(
        "responds with BAD_REQUEST when the logo isn't an image",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.setOrganizationLogo,
                { org: "acme", logo: notAnImage() },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("BAD_REQUEST", 400),
            );
        },
    );
});

describe("deleteOrganization", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.deleteOrganization,
                { org: "acme" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with FORBIDDEN to an admin",
        async ({ join, contextFor }) => {
            const admin = await join("admin");

            const result = call(
                appRouter.deleteOrganization,
                { org: "acme" },
                { context: await contextFor(admin.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("FORBIDDEN", 403),
            );
        },
    );

    ownedTest(
        "responds with CONFLICT while the organization has apps",
        async ({ db, contextFor, owned }) => {
            await createApp(
                db,
                { organizationId: owned.organization.id, name: "web" },
                "example.com",
            );

            const result = call(
                appRouter.deleteOrganization,
                { org: "acme" },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("CONFLICT", 409),
            );
        },
    );
});
