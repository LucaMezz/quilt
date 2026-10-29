import { describe, expect, it } from "vitest";

import { initials } from "./initials";

describe("initials", () => {
    it.each([
        ["Ada Lovelace", "AL"],
        ["ada lovelace", "AL"],
        ["Ada", "A"],
        ["Ada King Lovelace", "AK"],
        ["  Ada   Lovelace  ", "AL"],
        ["Ada\tLovelace", "AL"],
        ["Ádá Łovelace", "ÁŁ"],
        ["", ""],
        ["   ", ""],
    ])("turns %j into %j", (name, expected) => {
        expect(initials(name)).toBe(expected);
    });
});
