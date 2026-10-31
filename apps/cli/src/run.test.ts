import { ORPCError } from "@orpc/client";
import { defineCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCredential, setApiKeyFlag } from "./lib/credentials";
import { run } from "./run";

function rootRecording() {
    const seen: { app?: string; token?: string } = {};
    const root = defineCommand({
        meta: { name: "quilt" },
        subCommands: {
            show: defineCommand({
                meta: { name: "show" },
                args: { app: { type: "positional", required: true } },
                run({ args }) {
                    seen.app = args.app;
                    seen.token = getCredential("quilt.test")?.token;
                },
            }),
        },
    });
    return { root, seen };
}

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
    setApiKeyFlag(undefined);
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

    it("lists each invalid field the API reports", async () => {
        const error = new ORPCError("BAD_REQUEST", {
            message: "Input validation failed",
            data: {
                issues: [
                    { path: ["slug"], message: "Invalid string" },
                    { path: ["name"], message: "Too small" },
                ],
            },
        });

        await run(rootThrowing(error), ["fail"]);

        expect(printed()).toContain("Input validation failed");
        expect(printed()).toContain("slug: Invalid string");
        expect(printed()).toContain("name: Too small");
    });

    it.each([
        [["--api-key", "qlt_flag", "show", "blog"]],
        [["show", "blog", "-k", "qlt_flag"]],
        [["show", "--api-key=qlt_flag", "blog"]],
    ])("uses the key passed in %j", async (args) => {
        const { root, seen } = rootRecording();

        await run(root, args);

        expect(seen).toEqual({ app: "blog", token: "qlt_flag" });
    });

    it.each([
        [["show", "blog", "--api-key"]],
        [["show", "--api-key", "--json"]],
        [["show", "blog", "--api-key="]],
    ])("rejects %j without a key", async (args) => {
        const { root, seen } = rootRecording();

        await run(root, args);

        expect(seen).toEqual({});
        expect(printed()).toContain("--api-key needs a key");
        expect(process.exitCode).toBe(1);
    });
});
