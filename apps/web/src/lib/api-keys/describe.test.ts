import { describe, expect, it } from "vitest";

import {
    expiresSoon,
    grantedResources,
    keyStatus,
    samePermissions,
    ungrantedResources,
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

describe("grantedResources", () => {
    it("lists only resources with some access, in a stable order", () => {
        expect(
            grantedResources({ user: ["read"], apps: ["read", "write"] }),
        ).toEqual(["apps", "user"]);
    });

    it("leaves out resources with an empty grant", () => {
        expect(grantedResources({ apps: [] })).toEqual([]);
    });
});

describe("ungrantedResources", () => {
    it("lists every resource without access", () => {
        expect(ungrantedResources({ apps: ["read"] })).toEqual([
            "organizations",
            "apiKeys",
            "user",
        ]);
    });
});

describe("samePermissions", () => {
    it("compares access levels, not the order of actions", () => {
        expect(
            samePermissions(
                { apps: ["read", "write"] },
                { apps: ["write", "read"] },
            ),
        ).toBe(true);
    });

    it("treats an empty grant like no grant", () => {
        expect(samePermissions({ apps: [] }, {})).toBe(true);
    });

    it("notices a changed level", () => {
        expect(
            samePermissions({ apps: ["read"] }, { apps: ["read", "write"] }),
        ).toBe(false);
    });
});
