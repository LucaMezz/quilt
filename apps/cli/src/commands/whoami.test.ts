import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "../lib/auth-client";
import { getCredential, passedKey } from "../lib/credentials";
import { runCommand } from "../testing/command";
import whoami from "./whoami";

vi.mock("../client", () => ({ serverHost: "quilt.test" }));
vi.mock("../lib/auth-client", () => ({
    authClient: { getSession: vi.fn() },
}));
vi.mock("../lib/credentials");

const getSession = vi.mocked(authClient.getSession);

function signedIn(
    source: "keychain" | "file" | "QUILT_API_KEY" | "--api-key" = "keychain",
) {
    vi.mocked(getCredential).mockReturnValue({ token: "qlt_key", source });
}

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.resetAllMocks();
    process.exitCode = undefined;
});

function printed() {
    return vi
        .mocked(console.error)
        .mock.calls.map((args) => args.join(" "))
        .join("\n");
}

describe("whoami", () => {
    it("says so when not signed in", async () => {
        await runCommand(whoami, { rawArgs: [] });

        expect(printed()).toContain("--api-key");
        expect(printed()).toContain("Not signed in to quilt.test");
        expect(process.exitCode).toBe(1);
        expect(getCredential).toHaveBeenCalledWith("quilt.test");
    });

    it("shows the signed-in user and where the key is stored", async () => {
        signedIn("keychain");
        getSession.mockResolvedValue({
            data: { user: { name: "Ada", email: "ada@example.com" } },
            error: null,
        } as never);

        await runCommand(whoami, { rawArgs: [] });

        expect(getSession).toHaveBeenCalledWith({
            fetchOptions: { headers: { [API_KEY_HEADER]: "qlt_key" } },
        });
        expect(printed()).toContain("Signed in as Ada");
        expect(printed()).toContain("ada@example.com");
        expect(printed()).toContain("quilt.test");
        expect(printed()).toContain("system keychain");
        expect(process.exitCode).toBeUndefined();
    });

    it("says when the key was passed with --api-key", async () => {
        signedIn("--api-key");
        getSession.mockResolvedValue({
            data: { user: { name: "Ada", email: "ada@example.com" } },
            error: null,
        } as never);

        await runCommand(whoami, { rawArgs: [] });

        expect(printed()).toContain("Key passed with --api-key");
    });

    it.each([401, 403])(
        "says when the saved key is rejected with %i",
        async (status) => {
            signedIn();
            getSession.mockResolvedValue({
                data: null,
                error: { status, message: "Invalid API key." },
            } as never);

            await runCommand(whoami, { rawArgs: [] });

            expect(printed()).toContain("no longer valid");
            expect(printed()).toContain("quilt login");
            expect(printed()).toContain("--api-key");
            expect(process.exitCode).toBe(1);
        },
    );

    it("blames a passed-in key rather than the saved one", async () => {
        signedIn("--api-key");
        vi.mocked(passedKey).mockReturnValue({
            from: "passed with --api-key",
            reason: "--api-key was passed",
            fix: "Leave out --api-key",
        });
        getSession.mockResolvedValue({
            data: null,
            error: { status: 403, message: "Invalid API key." },
        } as never);

        await runCommand(whoami, { rawArgs: [] });

        expect(printed()).toContain(
            "The API key passed with --api-key isn't valid",
        );
        expect(printed()).not.toContain("to sign in again");
        expect(process.exitCode).toBe(1);
    });

    it("says when the server can't be reached", async () => {
        signedIn();
        getSession.mockRejectedValue(new TypeError("fetch failed"));

        await runCommand(whoami, { rawArgs: [] });

        expect(printed()).toContain("Could not reach quilt.test");
        expect(process.exitCode).toBe(1);
    });

    it("doesn't blame the key for a server error", async () => {
        signedIn();
        getSession.mockResolvedValue({
            data: null,
            error: { status: 500, message: "Internal Server Error" },
        } as never);

        await runCommand(whoami, { rawArgs: [] });

        expect(printed()).not.toContain("no longer valid");
        expect(printed()).toContain("Internal Server Error");
        expect(process.exitCode).toBe(1);
    });
});
