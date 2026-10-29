import { describe, expect } from "vitest";

import { resolveCaller } from "./caller";
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

    test("can't be used as bearer tokens without a signature", async ({
        auth,
    }) => {
        const { token } = await auth.api.signUpEmail({
            body: {
                name: "user",
                email: `user-${crypto.randomUUID()}@example.com`,
                password: "integration-password",
            },
        });

        const caller = await resolveCaller(
            auth,
            new Headers({ authorization: `Bearer ${token}` }),
        );

        expect(caller).toBeNull();
    });
});
