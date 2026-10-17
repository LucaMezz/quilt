import { describe, expect } from "vitest";

import { test } from "../../support/fixtures";

describe("GET /private", () => {
    test("returns the signed-in user", async ({ user }) => {
        const result = await user.rpc.privateData();

        expect(result.message).toBe("This is private");
        expect(result.user).toMatchObject(user.user);
    });

    test("rejects requests without a session", async ({ anonymous }) => {
        const response = await anonymous.rest("GET", "/private");

        expect(response.status).toBe(401);
        await expect(anonymous.rpc.privateData()).rejects.toMatchObject({
            code: "UNAUTHORIZED",
        });
    });
});
