import { call } from "@orpc/server";
import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { member } from "@quilt/db/schema/auth";
import { describe, expect } from "vitest";

import { resolveCaller } from "./caller";
import { appRouter } from "./routers/index";
import { test } from "./testing/fixtures";

function withApiKey(key: string, base = new Headers()) {
    const headers = new Headers(base);
    headers.set(API_KEY_HEADER, key);
    return headers;
}

describe("resolveCaller", () => {
    test("resolves a session from the session cookie", async ({
        auth,
        signUp,
    }) => {
        const caller = await signUp();

        const resolved = await resolveCaller(auth, caller.headers);

        expect(resolved).toMatchObject({
            kind: "session",
            userId: caller.user.id,
        });
    });

    test("resolves an API key to its owner", async ({ auth, signUp }) => {
        const owner = await signUp();
        const created = await auth.api.createApiKey({
            body: { name: "ci" },
            headers: owner.headers,
        });

        const resolved = await resolveCaller(auth, withApiKey(created.key));

        expect(resolved).toEqual({
            kind: "apiKey",
            userId: owner.user.id,
            apiKeyId: created.id,
        });
    });

    test("rejects a disabled key", async ({ auth, signUp }) => {
        const owner = await signUp();
        const created = await auth.api.createApiKey({
            body: { name: "ci" },
            headers: owner.headers,
        });
        await auth.api.updateApiKey({
            body: { keyId: created.id, enabled: false },
            headers: owner.headers,
        });

        expect(await resolveCaller(auth, withApiKey(created.key))).toBeNull();
    });

    test("does not fall back to the session when the key is invalid", async ({
        auth,
        signUp,
    }) => {
        const caller = await signUp();

        const resolved = await resolveCaller(
            auth,
            withApiKey("qlt_not-a-real-key", caller.headers),
        );

        expect(resolved).toBeNull();
    });

    test("resolves nothing without credentials", async ({ auth }) => {
        expect(await resolveCaller(auth, new Headers())).toBeNull();
    });
});

describe("API key callers", () => {
    test("can use every protected procedure", async ({
        auth,
        db,
        storage,
        signUp,
        createOrganization,
    }) => {
        const owner = await signUp();
        const { organization } = await createOrganization("acme");
        await db.insert(member).values({
            id: crypto.randomUUID(),
            organizationId: organization.id,
            userId: owner.user.id,
            role: "member",
            createdAt: new Date(),
        });
        const created = await auth.api.createApiKey({
            body: { name: "ci" },
            headers: owner.headers,
        });
        const headers = withApiKey(created.key);
        const context = {
            auth,
            db,
            storage,
            headers,
            appsDomain: "127.0.0.1.sslip.io",
            caller: await resolveCaller(auth, headers),
        };

        const organizations = await call(
            appRouter.listOrganizations,
            undefined,
            { context },
        );
        const keys = await call(appRouter.listApiKeys, {}, { context });

        expect(organizations.map((org) => org.id)).toEqual([organization.id]);
        expect(keys.items.map((key) => key.id)).toEqual([created.id]);
    });
});
