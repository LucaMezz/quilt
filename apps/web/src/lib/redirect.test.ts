import { describe, expect, it } from "vitest";

import { DEFAULT_REDIRECT, safeRedirect } from "./redirect";

describe("safeRedirect", () => {
    it("keeps paths within the app, including their search", () => {
        expect(safeRedirect("/device?user_code=WDJBMJHT")).toBe(
            "/device?user_code=WDJBMJHT",
        );
    });

    it.each([
        ["a missing value", undefined],
        ["a non-string", 42],
        ["an absolute URL", "https://evil.example"],
        ["a protocol-relative URL", "//evil.example"],
        [
            "a backslash URL browsers read as protocol-relative",
            "/\\evil.example",
        ],
        ["a relative path", "dashboard"],
    ])("falls back to the dashboard for %s", (_, target) => {
        expect(safeRedirect(target)).toBe(DEFAULT_REDIRECT);
    });
});
