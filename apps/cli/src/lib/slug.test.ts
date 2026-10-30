import { describe, expect, it } from "vitest";

import { slugify } from "./slug";

describe("slugify", () => {
    it.each([
        ["Acme", "acme"],
        ["Acme Labs", "acme-labs"],
        ["  Ünïcode & Co.  ", "unicode-co"],
        ["--a__b--", "a-b"],
        ["x".repeat(80), "x".repeat(63)],
    ])("turns %j into %j", (name, slug) => {
        expect(slugify(name)).toBe(slug);
    });

    it("doesn't end a truncated slug with a dash", () => {
        expect(slugify(`${"a".repeat(62)} b`)).toBe("a".repeat(62));
    });
});
