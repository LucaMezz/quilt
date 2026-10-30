import { describe, expect, it } from "vitest";

import {
    ACCESS_LEVEL_LABELS,
    ACCESS_LEVELS,
    API_KEY_RESOURCES,
    accessLevel,
    apiKeyStatements,
    withAccessLevel,
} from "./permissions";

describe("apiKeyStatements", () => {
    it("lets every resource be read and written", () => {
        for (const resource of Object.keys(API_KEY_RESOURCES)) {
            expect(apiKeyStatements).toHaveProperty(resource, [
                "read",
                "write",
            ]);
        }
    });
});

describe("ACCESS_LEVEL_LABELS", () => {
    it("names every level", () => {
        expect(Object.keys(ACCESS_LEVEL_LABELS)).toEqual([...ACCESS_LEVELS]);
    });
});

describe("accessLevel", () => {
    it("is none when the resource isn't granted", () => {
        expect(accessLevel({}, "apps")).toBe("none");
        expect(accessLevel({ apps: [] }, "apps")).toBe("none");
    });

    it("is read when only reading is granted", () => {
        expect(accessLevel({ apps: ["read"] }, "apps")).toBe("read");
    });

    it("is write when writing is granted", () => {
        expect(accessLevel({ apps: ["read", "write"] }, "apps")).toBe("write");
    });
});

describe("withAccessLevel", () => {
    it("grants reading and writing for write", () => {
        expect(withAccessLevel({}, "apps", "write")).toEqual({
            apps: ["read", "write"],
        });
    });

    it("grants only reading for read", () => {
        expect(
            withAccessLevel({ apps: ["read", "write"] }, "apps", "read"),
        ).toEqual({
            apps: ["read"],
        });
    });

    it("drops the resource for none", () => {
        expect(
            withAccessLevel({ apps: ["read"], user: ["read"] }, "apps", "none"),
        ).toEqual({ user: ["read"] });
    });

    it("leaves the original permissions alone", () => {
        const permissions = { apps: ["read" as const] };

        withAccessLevel(permissions, "apps", "write");

        expect(permissions).toEqual({ apps: ["read"] });
    });
});
