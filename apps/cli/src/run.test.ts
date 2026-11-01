import { stripVTControlCharacters } from "node:util";
import { Command } from "@commander-js/extra-typings";
import { ORPCError } from "@orpc/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCredential, setApiKeyFlag } from "./lib/credentials";
import { configureProgram } from "./program";
import { run } from "./run";
import { setDebugFlag } from "./ui/log";

function rootRecording() {
    const seen: { app?: string; token?: string } = {};
    const root = configureProgram(
        new Command("quilt").version("1.2.3", "-v, --version").addCommand(
            new Command("show")
                .description("Show an app")
                .argument("<app>")
                .action((app) => {
                    seen.app = app;
                    seen.token = getCredential("quilt.test")?.token;
                }),
        ),
    );
    return { root, seen };
}

function rootThrowing(error: unknown) {
    return configureProgram(
        new Command("quilt").addCommand(
            new Command("fail").action(() => {
                throw error;
            }),
        ),
    );
}

function output(stream: "log" | "error") {
    return stripVTControlCharacters(
        vi
            .mocked(console[stream])
            .mock.calls.map((args) => args.join(" "))
            .join("\n"),
    );
}

const printed = () => output("error");

beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    setApiKeyFlag(undefined);
    setDebugFlag(false);
    process.exitCode = undefined;
});

describe("run", () => {
    it("tells you to sign in when the API rejects your key", async () => {
        await run(rootThrowing(new ORPCError("UNAUTHORIZED")), ["fail"]);

        expect(printed()).toContain("Not signed in");
        expect(printed()).toContain("quilt login");
        expect(printed()).toContain("--api-key");
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
        expect(printed()).toContain("--api-key <key>");
        expect(printed()).toContain("quilt --help");
        expect(process.exitCode).toBe(1);
    });

    it("blames the key passed in when the API rejects it", async () => {
        await run(rootThrowing(new ORPCError("UNAUTHORIZED")), [
            "fail",
            "-k",
            "qlt_flag",
        ]);

        expect(printed()).toContain(
            "The API key passed with --api-key isn't valid",
        );
        expect(printed()).toContain("Leave out --api-key");
        expect(printed()).not.toContain("Not signed in");
        expect(process.exitCode).toBe(1);
    });

    it.each([[[]], [["--help"]]])(
        "prints help for %j to stdout",
        async (args) => {
            const { root } = rootRecording();

            await run(root, args);

            expect(output("log")).toContain("Usage");
            expect(output("log")).toContain("Show an app");
            expect(process.exitCode).toBe(0);
        },
    );

    it("prints a command's help", async () => {
        const { root, seen } = rootRecording();

        await run(root, ["show", "-h"]);

        expect(output("log")).toContain("quilt show <app> [options]");
        expect(seen).toEqual({});
        expect(process.exitCode).toBe(0);
    });

    it("prints the version", async () => {
        const { root } = rootRecording();

        await run(root, ["-v"]);

        expect(output("log")).toBe("1.2.3");
        expect(process.exitCode).toBe(0);
    });

    it("points at the command's help when it's used wrongly", async () => {
        const { root, seen } = rootRecording();

        await run(root, ["show"]);

        expect(seen).toEqual({});
        expect(printed()).toContain("Missing required argument 'app'");
        expect(printed()).toContain("Run quilt show --help to see usage.");
        expect(process.exitCode).toBe(1);
    });

    it("suggests the closest command for a typo", async () => {
        const { root } = rootRecording();

        await run(root, ["shwo"]);

        expect(printed()).toContain("Unknown command 'shwo'");
        expect(printed()).toContain("Did you mean show?");
        expect(process.exitCode).toBe(1);
    });

    it("prints the full error with its causes and data with --debug", async () => {
        const error = new ORPCError("NOT_FOUND", {
            message: "Organization not found",
            data: { org: "acme" },
            cause: new Error("row missing"),
        });

        await run(rootThrowing(error), ["fail", "--debug", "-k", "qlt_flag"]);

        expect(printed()).toContain("Organization not found");
        expect(printed()).toContain("debug Error: Organization not found");
        expect(printed()).toContain("debug code NOT_FOUND, status 404");
        expect(printed()).toMatch(/debug\s+at /);
        expect(printed()).toContain('debug data {"org":"acme"}');
        expect(printed()).toContain("debug caused by:");
        expect(printed()).toContain("debug Error: row missing");
    });

    it("says which server and key it uses with --debug", async () => {
        await run(rootThrowing(new Error("boom")), [
            "--debug",
            "fail",
            "--api-key",
            "qlt_flag",
        ]);

        expect(printed()).toMatch(/debug server http/);
        expect(printed()).toContain("debug api key --api-key");
        expect(printed()).not.toContain("qlt_flag");
    });

    it("prints no debug output without --debug", async () => {
        await run(rootThrowing(new Error("boom")), ["fail"]);

        expect(printed()).toContain("Unexpected error");
        expect(printed()).not.toContain("debug");
    });
});
