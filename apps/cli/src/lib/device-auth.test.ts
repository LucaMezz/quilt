import { setTimeout as sleep } from "node:timers/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "./auth-client";
import { pollForToken, requestDeviceCode } from "./device-auth";
import {
    LoginDeniedError,
    LoginExpiredError,
    LoginFailedError,
} from "./login-errors";

vi.mock("node:timers/promises", () => ({ setTimeout: vi.fn() }));

vi.mock("../client", () => ({ serverHost: "quilt.test" }));

vi.mock("./auth-client", () => ({
    authClient: {
        device: { code: vi.fn(), token: vi.fn() },
        getSession: vi.fn(),
    },
}));

const code = vi.mocked(authClient.device.code);
const token = vi.mocked(authClient.device.token);
const getSession = vi.mocked(authClient.getSession);

function tokenError(error: string, description = `${error} description`) {
    return {
        data: null,
        error: { error, error_description: description },
    } as never;
}

const tokenSuccess = { data: { access_token: "token" }, error: null } as never;

beforeEach(() => {
    vi.resetAllMocks();
});

describe("requestDeviceCode", () => {
    it("returns the device code", async () => {
        const data = { device_code: "device", user_code: "WDJBMJHT" };
        code.mockResolvedValue({ data, error: null } as never);

        await expect(requestDeviceCode()).resolves.toEqual(data);
        expect(code).toHaveBeenCalledWith({ client_id: "quilt-cli" });
    });

    it("throws the server's description when the request is rejected", async () => {
        code.mockResolvedValue({
            data: null,
            error: { error_description: "Unknown client" },
        } as never);

        await expect(requestDeviceCode()).rejects.toStrictEqual(
            new LoginFailedError("Unknown client"),
        );
    });

    it("throws when the server can't be reached", async () => {
        code.mockRejectedValue(new TypeError("fetch failed"));

        await expect(requestDeviceCode()).rejects.toStrictEqual(
            new LoginFailedError("Could not reach quilt.test"),
        );
    });
});

describe("pollForToken", () => {
    it("keeps polling while authorization is pending", async () => {
        token
            .mockResolvedValueOnce(tokenError("authorization_pending"))
            .mockResolvedValueOnce(tokenError("authorization_pending"))
            .mockResolvedValueOnce(tokenSuccess);
        const user = { name: "Ada", email: "ada@example.com" };
        getSession.mockResolvedValue({ data: { user } } as never);

        await expect(pollForToken("device", 5)).resolves.toEqual({
            accessToken: "token",
            user,
        });
        expect(token).toHaveBeenCalledTimes(3);
        expect(vi.mocked(sleep).mock.calls).toEqual([[5000], [5000], [5000]]);
    });

    it("looks up the user with the new access token", async () => {
        token.mockResolvedValue(tokenSuccess);
        getSession.mockResolvedValue({ data: null } as never);

        await expect(pollForToken("device", 5)).resolves.toEqual({
            accessToken: "token",
            user: undefined,
        });
        expect(getSession).toHaveBeenCalledWith({
            fetchOptions: { headers: { authorization: "Bearer token" } },
        });
    });

    it("waits 5 seconds longer each time it's asked to slow down", async () => {
        token
            .mockResolvedValueOnce(tokenError("slow_down"))
            .mockResolvedValueOnce(tokenError("slow_down"))
            .mockResolvedValueOnce(tokenSuccess);
        getSession.mockResolvedValue({ data: null } as never);

        await pollForToken("device", 5);

        expect(vi.mocked(sleep).mock.calls).toEqual([[5000], [10000], [15000]]);
    });

    it.each([
        ["access_denied", new LoginDeniedError()],
        ["expired_token", new LoginExpiredError()],
        ["invalid_grant", new LoginFailedError("invalid_grant description")],
    ])("throws when the server answers %s", async (error, expected) => {
        token.mockResolvedValue(tokenError(error));

        await expect(pollForToken("device", 5)).rejects.toStrictEqual(expected);
    });

    it("throws when the server can't be reached", async () => {
        token.mockRejectedValue(new TypeError("fetch failed"));

        await expect(pollForToken("device", 5)).rejects.toStrictEqual(
            new LoginFailedError("Could not reach quilt.test"),
        );
    });
});
