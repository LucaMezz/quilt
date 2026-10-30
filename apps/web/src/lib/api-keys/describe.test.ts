import { describe, expect, it } from "vitest";

import {
    accessSummary,
    expiresSoon,
    keyStatus,
    writableResources,
} from "./describe";

const now = new Date("2026-06-01T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function key(overrides: { enabled?: boolean; expiresAt?: Date | null }) {
    return { enabled: true, expiresAt: null, ...overrides };
}

describe("keyStatus", () => {
    it("is active when enabled and not expired", () => {
        expect(keyStatus(key({}), now)).toBe("active");
    });

    it("is disabled when turned off", () => {
        expect(keyStatus(key({ enabled: false }), now)).toBe("disabled");
    });

    it("is expired once the expiry has passed, even when disabled", () => {
        const expired = new Date(now.getTime() - DAY);

        expect(keyStatus(key({ expiresAt: expired }), now)).toBe("expired");
        expect(
            keyStatus(key({ enabled: false, expiresAt: expired }), now),
        ).toBe("expired");
    });
});

describe("expiresSoon", () => {
    it("is true within a week of expiry", () => {
        expect(
            expiresSoon(
                key({ expiresAt: new Date(now.getTime() + 3 * DAY) }),
                now,
            ),
        ).toBe(true);
    });

    it("is false further out, without expiry, or once expired", () => {
        expect(
            expiresSoon(
                key({ expiresAt: new Date(now.getTime() + 30 * DAY) }),
                now,
            ),
        ).toBe(false);
        expect(expiresSoon(key({}), now)).toBe(false);
        expect(
            expiresSoon(key({ expiresAt: new Date(now.getTime() - DAY) }), now),
        ).toBe(false);
    });
});

describe("accessSummary", () => {
    it("is none without permissions", () => {
        expect(accessSummary({})).toBe("none");
    });

    it("is read when every grant is read-only", () => {
        expect(accessSummary({ apps: ["read"], user: ["read"] })).toBe("read");
    });

    it("is write when any resource can be written", () => {
        expect(accessSummary({ apps: ["read"], user: ["read", "write"] })).toBe(
            "write",
        );
    });
});

describe("writableResources", () => {
    it("names the resources that can be written, in a stable order", () => {
        expect(
            writableResources({
                user: ["read", "write"],
                apps: ["read", "write"],
                organizations: ["read"],
            }),
        ).toEqual(["Apps", "Profile"]);
    });
});
