import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "../lib/auth-client";
import { getCredential } from "../lib/credentials";
import whoami from "./whoami";

vi.mock("../client", () => ({ serverHost: "quilt.test" }));
vi.mock("../lib/auth-client", () => ({
    authClient: { getSession: vi.fn() },
}));
vi.mock("../lib/credentials");

const getSession = vi.mocked(authClient.getSession);

function signedIn(source: "keychain" | "file" | "QUILT_TOKEN" = "keychain") {
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

    it("says when the saved key is no longer valid", async () => {
        signedIn();
        getSession.mockResolvedValue({
            data: null,
            error: { status: 401, message: "Invalid API key." },
        } as never);

        await runCommand(whoami, { rawArgs: [] });

        expect(printed()).toContain("no longer valid");
        expect(printed()).toContain("quilt login");
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
