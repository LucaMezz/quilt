import { describe, expect, it } from "vitest";

import { toDeviceRequest } from "./device-request";

describe("toDeviceRequest", () => {
    it("shows the CLI by name and splits the requested scopes", () => {
        expect(
            toDeviceRequest({
                status: "pending",
                client_id: "quilt-cli",
                scope: "openid profile",
            }),
        ).toEqual({ clientId: "quilt CLI", scopes: ["openid", "profile"] });
    });

    it("falls back to the client ID for unknown clients", () => {
        expect(
            toDeviceRequest({
                status: "pending",
                client_id: "other",
                scope: "",
            }),
        ).toEqual({ clientId: "other", scopes: [] });
    });

    it.each([
        ["already approved", { status: "approved", client_id: "quilt-cli" }],
        ["already denied", { status: "denied", client_id: "quilt-cli" }],
        ["claimed by another user", { status: "pending" }],
    ])("rejects a code that is %s", (_, verification) => {
        expect(() => toDeviceRequest(verification)).toThrow();
    });
});
