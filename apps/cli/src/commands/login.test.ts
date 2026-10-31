import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serverHost } from "../client";
import { getKeySession, revokeApiKey } from "../lib/api-key-session";
import { canOpenBrowser, openBrowser } from "../lib/browser";
import { getToken, passedKey, saveToken } from "../lib/credentials";
import { pollForToken, requestDeviceCode } from "../lib/device-auth";
import { LoginDeniedError } from "../lib/login-errors";
import login from "./login";

vi.mock("../lib/api-key-session");
vi.mock("../lib/browser");
vi.mock("../lib/credentials");
vi.mock("../lib/device-auth");

const deviceCode = {
    device_code: "device",
    user_code: "WDJBMJHT",
    verification_uri_complete: "http://quilt.test/device?user_code=WDJBMJHT",
    expires_in: 1800,
    interval: 5,
} as never;

function signedInAs(name: string) {
    vi.mocked(getToken).mockReturnValue("qlt_old");
    vi.mocked(getKeySession).mockResolvedValue({
        data: { user: { name, email: "ada@example.com" } },
        error: null,
    } as never);
}

function printed() {
    return vi
        .mocked(console.error)
        .mock.calls.map((args) => args.join(" "))
        .join("\n");
}

beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
    vi.mocked(requestDeviceCode).mockResolvedValue(deviceCode);
    vi.mocked(revokeApiKey).mockResolvedValue();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
    vi.useRealTimers();
    process.exitCode = undefined;
});

describe("login", () => {
    it("reports a login error and exits with 1", async () => {
        vi.mocked(pollForToken).mockRejectedValue(new LoginDeniedError());

        await runCommand(login, { rawArgs: [] });

        expect(process.exitCode).toBe(1);
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("The sign-in request was denied"),
        );
    });

    it("rethrows unexpected errors", async () => {
        const unexpected = new Error("bug");
        vi.mocked(pollForToken).mockRejectedValue(unexpected);

        await expect(runCommand(login, { rawArgs: [] })).rejects.toBe(
            unexpected,
        );
        expect(process.exitCode).toBeUndefined();
    });

    it("stops the countdown when polling fails", async () => {
        vi.useFakeTimers();
        vi.mocked(pollForToken).mockRejectedValue(new LoginDeniedError());

        await runCommand(login, { rawArgs: [] });

        expect(vi.getTimerCount()).toBe(0);
    });

    it("doesn't open a browser with --no-browser", async () => {
        vi.mocked(canOpenBrowser).mockReturnValue(true);
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "token",
            user: undefined,
        });

        await runCommand(login, { rawArgs: ["--no-browser"] });

        expect(openBrowser).not.toHaveBeenCalled();
    });

    it("saves the token for the server", async () => {
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "token",
            user: undefined,
        });

        await runCommand(login, { rawArgs: [] });

        expect(saveToken).toHaveBeenCalledWith(serverHost, "token");
    });

    it("warns when the token is saved to a file", async () => {
        vi.mocked(saveToken).mockReturnValue("file");
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "token",
            user: undefined,
        });

        await runCommand(login, { rawArgs: [] });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("No system keychain found"),
        );
    });

    it("refuses while a key is passed in", async () => {
        vi.mocked(passedKey).mockReturnValue({
            from: "in QUILT_TOKEN",
            reason: "QUILT_TOKEN is set",
            fix: "Unset QUILT_TOKEN",
        });

        await runCommand(login, { rawArgs: [] });

        expect(requestDeviceCode).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("QUILT_TOKEN"),
        );
        expect(process.exitCode).toBe(1);
    });

    it("doesn't sign in again when already signed in", async () => {
        signedInAs("Ada");

        await runCommand(login, { rawArgs: [] });

        expect(getKeySession).toHaveBeenCalledWith("qlt_old");
        expect(requestDeviceCode).not.toHaveBeenCalled();
        expect(printed()).toContain("Already signed in as");
        expect(printed()).toContain("--force");
        expect(process.exitCode).toBeUndefined();
    });

    it("signs in again with --force and revokes the old key", async () => {
        signedInAs("Ada");
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "qlt_new",
            user: undefined,
        });

        await runCommand(login, { rawArgs: ["--force"] });

        expect(saveToken).toHaveBeenCalledWith(serverHost, "qlt_new");
        expect(revokeApiKey).toHaveBeenCalledWith("qlt_old");
        expect(vi.mocked(saveToken).mock.invocationCallOrder[0]).toBeLessThan(
            vi.mocked(revokeApiKey).mock.invocationCallOrder[0] ?? 0,
        );
    });

    it("signs in again with -f", async () => {
        signedInAs("Ada");
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "qlt_new",
            user: undefined,
        });

        await runCommand(login, { rawArgs: ["-f"] });

        expect(saveToken).toHaveBeenCalledWith(serverHost, "qlt_new");
    });

    it("signs in again when the saved key is no longer valid", async () => {
        vi.mocked(getToken).mockReturnValue("qlt_old");
        vi.mocked(getKeySession).mockResolvedValue({
            data: null,
            error: { status: 401 },
        } as never);
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "qlt_new",
            user: undefined,
        });

        await runCommand(login, { rawArgs: [] });

        expect(saveToken).toHaveBeenCalledWith(serverHost, "qlt_new");
    });

    it("warns when the old key can't be revoked", async () => {
        signedInAs("Ada");
        vi.mocked(pollForToken).mockResolvedValue({
            accessToken: "qlt_new",
            user: undefined,
        });
        vi.mocked(revokeApiKey).mockRejectedValue(new Error("offline"));

        await runCommand(login, { rawArgs: ["--force"] });

        expect(saveToken).toHaveBeenCalledWith(serverHost, "qlt_new");
        expect(printed()).toContain("Signed in");
        expect(printed()).toContain("couldn't revoke");
        expect(process.exitCode).toBeUndefined();
    });
});
