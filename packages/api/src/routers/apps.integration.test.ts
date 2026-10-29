import { call } from "@orpc/server";
import { describe, expect } from "vitest";

import { createApp } from "../services/apps";
import { getMemberOrganization } from "../services/organizations";
import { test } from "../testing/fixtures";
import { appRouter } from "./index";

const ownedTest = test.extend(
    "owned",
    { auto: true },
    async ({ auth, db, signUp }) => {
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
        await createApp(
            db,
            { organizationId: organization.id, name: "web" },
            "example.com",
        );
        return { owner, organization };
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

describe("createApp", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.createApp,
                { org: "acme", name: "api" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with CONFLICT when another organization uses the name",
        async ({ auth, contextFor, signUp }) => {
            const other = await signUp("other");
            await auth.api.createOrganization({
                body: { name: "Globex", slug: "globex" },
                headers: other.headers,
            });

            const result = call(
                appRouter.createApp,
                { org: "globex", name: "web" },
                { context: await contextFor(other.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("CONFLICT", 409),
            );
        },
    );
});

describe("destroyApp", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.destroyApp,
                { org: "acme", name: "web" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with NOT_FOUND for an app that doesn't exist",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.destroyApp,
                { org: "acme", name: "missing" },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );
});

describe("setAppLogo", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.setAppLogo,
                { org: "acme", name: "web", logo: notAnImage() },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with NOT_FOUND for an app that doesn't exist",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.setAppLogo,
                { org: "acme", name: "missing", logo: notAnImage() },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with BAD_REQUEST when the logo isn't an image",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.setAppLogo,
                { org: "acme", name: "web", logo: notAnImage() },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("BAD_REQUEST", 400),
            );
        },
    );
});

describe("listApps", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.listApps,
                { org: "acme" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declared("NOT_FOUND", 404),
            );
        },
    );
});
