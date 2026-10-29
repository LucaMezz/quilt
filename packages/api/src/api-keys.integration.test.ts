import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { describe, expect } from "vitest";

import { test } from "./testing/fixtures";

describe("api keys", () => {
    test("verifies a key created for a user", async ({ auth, signUp }) => {
        const caller = await signUp();
        const created = await auth.api.createApiKey({
            body: { name: "cli" },
            headers: caller.headers,
        });

        const result = await auth.api.verifyApiKey({
            body: { key: created.key },
        });

        expect(result.valid).toBe(true);
        expect(result.key?.referenceId).toBe(caller.user.id);
    });

    test("rejects a key that is no longer valid", async ({ auth, signUp }) => {
        const caller = await signUp();
        const created = await auth.api.createApiKey({
            headers: caller.headers,
            body: { name: "cli" },
        });

        const { success } = await auth.api.deleteApiKey({
            headers: caller.headers,
            body: { keyId: created.id },
        });

        expect(success).toBe(true);

        const result = await auth.api.verifyApiKey({
            body: { key: created.key },
        });

        expect(result.valid).toBe(false);
    });

    test("acts for its owner on session endpoints", async ({
        auth,
        signUp,
    }) => {
        const caller = await signUp();
        await auth.api.createOrganization({
            body: { name: "Acme", slug: `acme-${crypto.randomUUID()}` },
            headers: caller.headers,
        });
        const created = await auth.api.createApiKey({
            body: { name: "cli" },
            headers: caller.headers,
        });

        const organizations = await auth.api.listOrganizations({
            headers: new Headers({ [API_KEY_HEADER]: created.key }),
        });

        expect(organizations.map((org) => org.name)).toEqual(["Acme"]);
    });
});
