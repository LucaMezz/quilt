import { describe, expect } from "vitest";

import { resolveCaller } from "./caller";
import { test } from "./testing/fixtures";

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

    test("resolves nothing without credentials", async ({ auth }) => {
        expect(await resolveCaller(auth, new Headers())).toBeNull();
    });
});
