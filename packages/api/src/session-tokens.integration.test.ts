import { describe, expect } from "vitest";

import { test } from "./testing/fixtures";

describe("session tokens", () => {
    test("aren't exposed to scripts on sign-in", async ({ auth }) => {
        const { headers } = await auth.api.signUpEmail({
            body: {
                name: "user",
                email: `user-${crypto.randomUUID()}@example.com`,
                password: "integration-password",
            },
            returnHeaders: true,
        });

        expect(headers.get("set-auth-token")).toBeNull();
    });
});
