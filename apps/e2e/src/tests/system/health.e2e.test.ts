import { describe, expect } from "vitest";

import { test } from "../../support/fixtures";

describe("GET /health", () => {
    test("responds OK over REST", async ({ anonymous }) => {
        const response = await anonymous.rest("GET", "/health");

        expect(response.status).toBe(200);
        expect(await response.json()).toBe("OK");
    });

    test("responds OK over RPC", async ({ anonymous }) => {
        await expect(anonymous.rpc.healthCheck()).resolves.toBe("OK");
    });
});
