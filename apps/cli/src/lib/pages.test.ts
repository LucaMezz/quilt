import { describe, expect, it, vi } from "vitest";

import { allPages } from "./pages";

describe("allPages", () => {
    it("follows the cursor until the last page", async () => {
        const fetchPage = vi
            .fn()
            .mockResolvedValueOnce({ items: [1, 2], nextCursor: "c1" })
            .mockResolvedValueOnce({ items: [3], nextCursor: "c2" })
            .mockResolvedValueOnce({ items: [4], nextCursor: null });

        await expect(allPages(fetchPage)).resolves.toEqual([1, 2, 3, 4]);
        expect(fetchPage.mock.calls).toEqual([[undefined], ["c1"], ["c2"]]);
    });
});
