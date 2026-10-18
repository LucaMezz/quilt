// Example unit tests: call procedures directly with a hand-built context, so no
// HTTP server or database is needed. Copy this pattern for real tests.
import { call, ORPCError } from "@orpc/server";
import type { Database } from "@quilt/db";
import { describe, expect, it } from "vitest";

import type { Context } from "../context";
import { appRouter } from "./index";

function createContext(overrides: Partial<Context> = {}): Context {
    return {
        session: null,
        // Procedures under test here don't touch the database.
        db: {} as Database,
        appsDomain: "127.0.0.1.sslip.io",
        ...overrides,
    };
}

describe("example", () => {
    it("returns OK from the health check", async () => {
        const result = await call(appRouter.healthCheck, undefined, {
            context: createContext(),
        });

        expect(result).toBe("OK");
    });

    it("rejects protected procedures without a session", async () => {
        const result = call(
            appRouter.listApps,
            {},
            { context: createContext() },
        );

        await expect(result).rejects.toBeInstanceOf(ORPCError);
        await expect(result).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });
});
