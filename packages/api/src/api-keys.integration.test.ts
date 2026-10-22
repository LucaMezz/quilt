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
});
