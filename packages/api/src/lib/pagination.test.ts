import { describe, expect, it } from "vitest";

import {
    encodeCursor,
    PageInput,
    paginateInMemory,
    toPage,
} from "./pagination";

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

describe("paginateInMemory", () => {
    const c = row("c", "2026-10-18T04:00:03.000Z");
    const b2 = row("b2", "2026-10-18T04:00:02.000Z");
    const b1 = row("b1", "2026-10-18T04:00:02.000Z");
    const a = row("a", "2026-10-18T04:00:01.000Z");
    const rows = [a, b1, c, b2];

    function ids(page: { items: { id: string }[] }) {
        return page.items.map((item) => item.id);
    }

    it("orders newest first and breaks createdAt ties by id", () => {
        const page = paginateInMemory(rows, { limit: 10 });

        expect(ids(page)).toEqual(["c", "b2", "b1", "a"]);
        expect(page.nextCursor).toBeNull();
    });

    it("splits rows sharing a createdAt across pages without skipping or repeating", () => {
        const first = paginateInMemory(rows, { limit: 2 });
        const second = paginateInMemory(rows, {
            limit: 2,
            cursor: PageInput.parse({ cursor: first.nextCursor }).cursor,
        });

        expect(ids(first)).toEqual(["c", "b2"]);
        expect(ids(second)).toEqual(["b1", "a"]);
        expect(second.nextCursor).toBeNull();
    });

    it("resumes after the cursor position even when that row is gone", () => {
        const withoutB2 = rows.filter((item) => item.id !== "b2");

        const page = paginateInMemory(withoutB2, { limit: 10, cursor: b2 });

        expect(ids(page)).toEqual(["b1", "a"]);
    });

    it("returns no cursor when exactly limit rows remain", () => {
        expect(paginateInMemory(rows, { limit: 4 }).nextCursor).toBeNull();
    });

    it("leaves the input array untouched", () => {
        paginateInMemory(rows, { limit: 10 });

        expect(ids({ items: rows })).toEqual(["a", "b1", "c", "b2"]);
    });
});
