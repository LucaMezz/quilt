import { describe, expect, it } from "vitest";

import {
    formatUserCode,
    isCompleteUserCode,
    normalizeUserCode,
} from "./user-code";

describe("normalizeUserCode", () => {
    it("uppercases and strips separators and whitespace", () => {
        expect(normalizeUserCode(" wdjb-mjht ")).toBe("WDJBMJHT");
        expect(normalizeUserCode("wdjb mjht")).toBe("WDJBMJHT");
    });

    it("truncates to the code length", () => {
        expect(normalizeUserCode("WDJBMJHTXYZ")).toBe("WDJBMJHT");
    });
});

describe("formatUserCode", () => {
    it("groups a full code into two halves", () => {
        expect(formatUserCode("wdjbmjht")).toBe("WDJB-MJHT");
    });

    it("leaves a partial first half ungrouped", () => {
        expect(formatUserCode("WDJ")).toBe("WDJ");
    });
});

describe("isCompleteUserCode", () => {
    it("accepts a full code from the user code alphabet", () => {
        expect(isCompleteUserCode("WDJBMJHT")).toBe(true);
    });

    it("rejects short codes", () => {
        expect(isCompleteUserCode("WDJB")).toBe(false);
    });

    it("rejects characters that are easy to confuse", () => {
        expect(isCompleteUserCode("WDJB0OI1")).toBe(false);
    });
});
