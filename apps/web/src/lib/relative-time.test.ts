import { describe, expect, it } from "vitest";

import { relativeTime } from "./relative-time";

const now = new Date("2026-06-01T12:00:00Z");
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function at(offset: number) {
    return new Date(now.getTime() + offset);
}

describe("relativeTime", () => {
    it.each([
        [5 * DAY, "in 5 days"],
        [-3 * DAY, "3 days ago"],
        [DAY, "tomorrow"],
        [-2 * HOUR, "2 hours ago"],
        [90 * DAY, "in 3 months"],
        [-400 * DAY, "last year"],
        [-30 * 1000, "now"],
    ])("describes an offset of %d ms as %j", (offset, text) => {
        expect(relativeTime(at(offset), now)).toBe(text);
    });
});
