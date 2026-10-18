import { describe, expect, it } from "vitest";

import { encodeCursor, PageInput, toPage } from "./pagination";

function row(id: string, createdAt: string) {
    return { id, createdAt: new Date(createdAt) };
}

describe("PageInput", () => {
    it("defaults the limit and coerces query strings", () => {
        expect(PageInput.parse({}).limit).toBe(50);
        expect(PageInput.parse({ limit: "10" }).limit).toBe(10);
    });

    it("decodes a cursor back to the row it was built from", () => {
        const last = row("b", "2026-10-18T04:00:00.123Z");

        const { cursor } = PageInput.parse({ cursor: encodeCursor(last) });

        expect(cursor).toEqual(last);
    });

    it("rejects cursors it did not issue", () => {
        expect(PageInput.safeParse({ cursor: "not-a-cursor" }).success).toBe(
            false,
        );
        const wrongShape = Buffer.from('{"id":1}').toString("base64url");
        expect(PageInput.safeParse({ cursor: wrongShape }).success).toBe(false);
    });
});

describe("toPage", () => {
    const c = row("c", "2026-10-18T04:00:03.000Z");
    const b = row("b", "2026-10-18T04:00:02.000Z");
    const a = row("a", "2026-10-18T04:00:01.000Z");
    const rows = [c, b, a];

    it("trims the extra row and points the cursor at the last item kept", () => {
        const page = toPage(rows, 2);

        expect(page.items.map((item) => item.id)).toEqual(["c", "b"]);
        expect(page.nextCursor).toBe(encodeCursor(b));
    });

    it("returns no cursor on the last page", () => {
        expect(toPage(rows, 3).nextCursor).toBeNull();
        expect(toPage([], 3)).toEqual({ items: [], nextCursor: null });
    });
});
