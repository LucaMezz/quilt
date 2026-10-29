import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serverHost } from "../client";
import { canOpenBrowser, openBrowser } from "../lib/browser";
import { saveToken } from "../lib/credentials";
import { pollForToken, requestDeviceCode } from "../lib/device-auth";
import { LoginDeniedError } from "../lib/login-errors";
import login from "./login";

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

beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
    vi.mocked(requestDeviceCode).mockResolvedValue(deviceCode);
});

afterEach(() => {
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
});
