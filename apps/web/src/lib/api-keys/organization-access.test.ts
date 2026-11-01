import { describe, expect, it } from "vitest";

import {
    accessFor,
    choiceFor,
    missingOrganizations,
    sameOrganizationAccess,
} from "./organization-access";

describe("choiceFor and accessFor", () => {
    it("round-trip every organization and a selection", () => {
        expect(accessFor(choiceFor("all"))).toBe("all");
        expect(accessFor(choiceFor(["a", "b"]))).toEqual(["a", "b"]);
    });

    it("drop a remembered selection once every organization is chosen", () => {
        expect(accessFor({ mode: "all", ids: ["a"] })).toBe("all");
    });
});

describe("missingOrganizations", () => {
    it("is true only when limited to no organizations", () => {
        expect(missingOrganizations({ mode: "selected", ids: [] })).toBe(true);
        expect(missingOrganizations({ mode: "selected", ids: ["a"] })).toBe(
            false,
        );
        expect(missingOrganizations({ mode: "all", ids: [] })).toBe(false);
    });
});

describe("sameOrganizationAccess", () => {
    it("ignores the order of selected organizations", () => {
        expect(sameOrganizationAccess(["a", "b"], ["b", "a"])).toBe(true);
    });

    it("tells all organizations apart from a selection", () => {
        expect(sameOrganizationAccess("all", "all")).toBe(true);
        expect(sameOrganizationAccess("all", ["a"])).toBe(false);
        expect(sameOrganizationAccess(["a"], ["a", "b"])).toBe(false);
    });
});
