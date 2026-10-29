import { call } from "@orpc/server";
import { describe, expect } from "vitest";

import { createApp } from "../services/apps";
import { declaredError } from "../testing/errors";
import { test } from "../testing/fixtures";
import { notAnImage } from "../testing/images";
import { createOrganizationAs } from "../testing/organizations";
import { appRouter } from "./index";

const ownedTest = test.extend(
    "owned",
    { auto: true },
    async ({ auth, db, signUp }) => {
        const owner = await signUp("owner");
        const organization = await createOrganizationAs(
            auth,
            db,
            owner.headers,
        );
        await createApp(
            db,
            { organizationId: organization.id, name: "web" },
            "example.com",
        );
        return { owner, organization };
    },
);

describe("createApp", () => {
    ownedTest(
        "responds with NOT_FOUND to a non-member",
        async ({ signUp, contextFor }) => {
            const outsider = await signUp("outsider");

            const result = call(
                appRouter.apps.create,
                { org: "acme", name: "api" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
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
                appRouter.apps.create,
                { org: "globex", name: "web" },
                { context: await contextFor(other.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("CONFLICT", 409),
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
                appRouter.apps.destroy,
                { org: "acme", name: "web" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with NOT_FOUND for an app that doesn't exist",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.apps.destroy,
                { org: "acme", name: "missing" },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
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
                appRouter.apps.setLogo,
                { org: "acme", name: "web", logo: notAnImage() },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with NOT_FOUND for an app that doesn't exist",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.apps.setLogo,
                { org: "acme", name: "missing", logo: notAnImage() },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );

    ownedTest(
        "responds with BAD_REQUEST when the logo isn't an image",
        async ({ contextFor, owned }) => {
            const result = call(
                appRouter.apps.setLogo,
                { org: "acme", name: "web", logo: notAnImage() },
                { context: await contextFor(owned.owner.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("BAD_REQUEST", 400),
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
                appRouter.apps.list,
                { org: "acme" },
                { context: await contextFor(outsider.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );
});
