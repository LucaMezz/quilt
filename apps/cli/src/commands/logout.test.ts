import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../client";
import { authClient } from "../lib/auth-client";
import { deleteToken, getToken } from "../lib/credentials";
import logout from "./logout";

vi.mock("../client", () => ({
    serverHost: "quilt.test",
    client: { deleteApiKey: vi.fn() },
}));
vi.mock("../lib/auth-client", () => ({
    authClient: { getSession: vi.fn() },
}));
vi.mock("../lib/credentials");

const getSession = vi.mocked(authClient.getSession);

function signedIn() {
    vi.mocked(getToken).mockReturnValue("qlt_key");
    getSession.mockResolvedValue({
        data: { session: { id: "key-id" } },
    } as never);
}

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
    process.exitCode = undefined;
});

describe("logout", () => {
    it("says so when not signed in", async () => {
        vi.mocked(getToken).mockReturnValue(undefined);

        await runCommand(logout, { rawArgs: [] });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Not signed in to quilt.test"),
        );
        expect(process.exitCode).toBeUndefined();
    });

    it("revokes the key on the server and forgets it", async () => {
        signedIn();

        await runCommand(logout, { rawArgs: [] });

        expect(getSession).toHaveBeenCalledWith({
            fetchOptions: { headers: { [API_KEY_HEADER]: "qlt_key" } },
        });
        expect(client.deleteApiKey).toHaveBeenCalledWith({ id: "key-id" });
        expect(deleteToken).toHaveBeenCalledWith("quilt.test");
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Signed out of quilt.test"),
        );
    });

    it("leaves a QUILT_TOKEN key alone", async () => {
        vi.stubEnv("QUILT_TOKEN", "qlt_key");
        signedIn();

        await runCommand(logout, { rawArgs: [] });

        expect(process.exitCode).toBe(1);
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("QUILT_TOKEN"),
        );
        expect(client.deleteApiKey).not.toHaveBeenCalled();
        expect(deleteToken).not.toHaveBeenCalled();
    });

    it("forgets the key even when the server can't revoke it", async () => {
        signedIn();
        vi.mocked(client.deleteApiKey).mockRejectedValue(new Error("offline"));

        await runCommand(logout, { rawArgs: [] });

        expect(deleteToken).toHaveBeenCalledWith("quilt.test");
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("couldn't revoke"),
        );
        expect(process.exitCode).toBe(1);
    });
});
