import { ORPCError } from "@orpc/client";
import { defineCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { run } from "./run";

function rootThrowing(error: unknown) {
    return defineCommand({
        meta: { name: "quilt" },
        subCommands: {
            fail: defineCommand({
                meta: { name: "fail" },
                run() {
                    throw error;
                },
            }),
        },
    });
}

function printed() {
    return vi
        .mocked(console.error)
        .mock.calls.map((args) => args.join(" "))
        .join("\n");
}

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
});

describe("run", () => {
    it("tells you to sign in when the API rejects your key", async () => {
        await run(rootThrowing(new ORPCError("UNAUTHORIZED")), ["fail"]);

        expect(printed()).toContain("Not signed in");
        expect(printed()).toContain("quilt login");
        expect(printed()).not.toContain("Unexpected error");
        expect(process.exitCode).toBe(1);
    });

    it("shows the API's message for other API errors", async () => {
        const error = new ORPCError("NOT_FOUND", {
            message: "Organization not found",
        });

        await run(rootThrowing(error), ["fail"]);

        expect(printed()).toContain("Organization not found");
        expect(printed()).not.toContain("Unexpected error");
        expect(process.exitCode).toBe(1);
    });
});
