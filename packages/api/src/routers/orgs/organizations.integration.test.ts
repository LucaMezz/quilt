import { call } from "@orpc/server";
import { describe, expect } from "vitest";
import { appRouter } from "#/routers/index";
import { createApp } from "#/services/orgs/apps";
import { declaredError } from "#/testing/errors";
import { test } from "#/testing/fixtures";
import { notAnImage } from "#/testing/images";
import { createOrganizationAs } from "#/testing/organizations";

const ownedTest = test
    .extend("owned", { auto: true }, async ({ auth, db, signUp }) => {
        const owner = await signUp("owner");
        const organization = await createOrganizationAs(
            auth,
            db,
            owner.headers,
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

describe("getOrganization", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.organizations.get,
                { org: "acme" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
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
                appRouter.organizations.create,
                { name: "Acme", slug: "acme" },
                { context: await contextFor(other.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("CONFLICT", 409),
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
                appRouter.organizations.update,
                { org: "acme", name: "Hijacked" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
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
                appRouter.organizations.update,
                { org: "acme", slug: "globex" },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("CONFLICT", 409),
            );
        },
    );

    ownedTest(
        "responds with FORBIDDEN to a member",
        async ({ join, contextFor }) => {
            const member = await join("member");

            const result = call(
                appRouter.organizations.update,
                { org: "acme", name: "Hijacked" },
                { context: await contextFor(member.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("FORBIDDEN", 403),
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
                appRouter.organizations.setLogo,
                { org: "acme", logo: notAnImage() },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with FORBIDDEN to a member",
        async ({ join, contextFor }) => {
            const member = await join("member");

            const result = call(
                appRouter.organizations.setLogo,
                { org: "acme", logo: notAnImage() },
                { context: await contextFor(member.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("FORBIDDEN", 403),
            );
        },
    );

    ownedTest(
        "responds with BAD_REQUEST when the logo isn't an image",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.organizations.setLogo,
                { org: "acme", logo: notAnImage() },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("BAD_REQUEST", 400),
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
                appRouter.organizations.delete,
                { org: "acme" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with FORBIDDEN to an admin",
        async ({ join, contextFor }) => {
            const admin = await join("admin");

            const result = call(
                appRouter.organizations.delete,
                { org: "acme" },
                { context: await contextFor(admin.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("FORBIDDEN", 403),
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
                appRouter.organizations.delete,
                { org: "acme" },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("CONFLICT", 409),
            );
        },
    );
});
