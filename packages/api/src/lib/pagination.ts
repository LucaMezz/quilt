/**
 * @module
 *
 * Keyset (cursor) pagination: more reliable than offset pagination for large
 * datasets.
 *
 * ## Why not offset (`?page=&limit=`)
 *
 * Offset breaks when rows change between requests. Rows inserted before the end
 * of page 1 push items onto page 2, so they show twice; rows deleted from page 1
 * pull items back, so they are skipped. A keyset cursor marks the last item of
 * the previous page and the next page starts after it, so neither happens, as
 * long as the sort key never changes (true for `createdAt`). This matters most
 * when rows are inserted or deleted often.
 *
 * ## Why the cursor holds `createdAt` and `id`
 *
 * Several rows can share a `createdAt`. The unique `id` orders rows within each
 * tie, keeping pagination deterministic.
 *
 * ## Trade-offs
 *
 * Queries are more complex and the cursor needs extra logic. You can't jump to a
 * page without the cursor for the one before it, which makes page jumping and
 * showing the total page count harder.
 *
 * ## When to use vs offset pagination
 *
 * Keyset fits large lists, lists that grow constantly, or infinite scroll /
 * "load more" lists, where duplicates or skipped rows would be noticable.
 *
 * Offset fits small or bounded lists that rarely change, where page numbers
 * help (like API keys).
 *
 * Ask yourself:
 *  - how big can the list get?
 *  - how often do rows change while someone is paging?
 *  - does the UI need to jump to page N?
 *
 */

import { and, desc, eq, lt, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

/**
 * Holds the values for the `id` and `createdAt` columns of
 * a row in memory.
 */
type KeysetRow = {
    createdAt: Date;
    id: string;
};

/**
 * Holds references to the `id` and `createdAt` columns of
 * a table in the postgres database. Used to build queries
 * that filter and sort by these columns.
 *
 * `createdAt` must be `timestamp` precision 3. Postgres stores microseconds by
 * default, but a JS `Date` only holds milliseconds, so the cursor would lose
 * digits and the next page would skip rows created in that gap.
 *
 * E.g. a page ending on a row at `10:15:00.123456` gives a cursor of
 * `10:15:00.123`; a row at `10:15:00.123400` is neither before nor equal to
 * that, so it never appears, evne though it should.
 */
type KeysetColumns = {
    createdAt: PgColumn;
    id: PgColumn;
};

const CursorPayload = z.object({
    createdAt: z.iso.datetime(),
    id: z.string().min(1),
});

/**
 * Encodes the `createdAt` and `id` values of a row into a base64url
 * string so that it can be used within a URL as a cursor for pagination.
 * Used to mark the last item of a page so that the next request can
 * start from the next item after it.
 *
 * Encoding it as a base64url string also signals that the cursor is
 * opaque to client, meaning that clients should not depend on its
 * structure or contents, and should treat it as a black box. This
 * allows the server to change the cursor format in the future without
 * breaking clients.
 *
 * @param row - The last item of the page, with its `createdAt` and `id`.
 * @returns An opaque base64url string, returned to clients as `nextCursor`.
 * @throws {RangeError} If `row.createdAt` is an invalid `Date`.
 */
export function encodeCursor(row: KeysetRow): string {
    const payload = { createdAt: row.createdAt.toISOString(), id: row.id };
    return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(value: string): KeysetRow | undefined {
    try {
        const json = JSON.parse(Buffer.from(value, "base64url").toString());
        const parsed = CursorPayload.safeParse(json);
        if (!parsed.success) return undefined;
        return {
            createdAt: new Date(parsed.data.createdAt),
            id: parsed.data.id,
        };
    } catch {
        return undefined;
    }
}

const Cursor = z.string().transform((value, ctx) => {
    const cursor = decodeCursor(value);
    if (!cursor) {
        ctx.addIssue({ code: "custom", message: "Invalid cursor" });
        return z.NEVER;
    }
    return cursor;
});

/**
 * The input schema for list procedures. Extend it with the procedure's own
 * fields, e.g. `PageInput.extend(OrganizationRef.shape)`.
 *
 * Parsing coerces `limit` from a query-string value to a number between 1 and
 * 100 (default 50), and decodes `cursor` from its base64url string into
 * `{ createdAt, id }`. An invalid cursor fails validation, which oRPC returns
 * as a 400.
 */
export const PageInput = z.object({
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50)
        .describe("Maximum number of items to return"),
    cursor: Cursor.optional().describe(
        "`nextCursor` from the previous page; omit for the first page",
    ),
});

/**
 * The parsed form of `PageInput` that services receive: `limit` is always a
 * number, and `cursor` is the decoded `{ createdAt, id }` (or `undefined` on
 * the first page), ready to pass to `afterCursor`.
 */
export type PageParams = z.output<typeof PageInput>;

/**
 * Creates a Zod schema for a page of items, where `item` is the Zod schema for
 * each item.
 *
 * @typeParam T - The Zod schema type of one item.
 * @param item - The schema each item in the page must match.
 * @returns A Zod schema for `{ items, nextCursor }`, for a procedure's output.
 */
export function pageOf<T extends z.ZodType>(item: T) {
    return z.object({
        items: z.array(item),
        nextCursor: z
            .string()
            .nullable()
            .describe(
                "Pass as `cursor` to get the next page; `null` on the last page",
            ),
    });
}

/**
 * A page of items, with a cursor for the next page if there is one.
 *
 * @typeParam T - The type of one item in the page.
 */
export type Page<T> = {
    items: T[];
    nextCursor: string | null;
};

/**
 * Creates the sql condition to filter rows that sort after the given
 * cursor in `keysetOrder`.
 *
 * @param columns - The table's `createdAt` and `id` columns to compare against.
 * @param cursor - The decoded cursor from the request, or `undefined` for the
 *   first page.
 * @returns A `WHERE` condition matching rows that sort after the cursor, or
 *   `undefined` when there is no cursor (Drizzle's `and()` ignores it).
 */
export function afterCursor(
    columns: KeysetColumns,
    cursor: KeysetRow | undefined,
): SQL | undefined {
    if (!cursor) return undefined;
    return or(
        lt(columns.createdAt, cursor.createdAt),
        and(eq(columns.createdAt, cursor.createdAt), lt(columns.id, cursor.id)),
    );
}

/**
 * Creates the sql ordering terms to sort rows by newest first, and breaking
 * ties with `id`.
 *
 * @param columns - The table's `createdAt` and `id` columns to sort by.
 * @returns `ORDER BY` terms for newest first, with `id` breaking ties. Must
 *   match the order `afterCursor` assumes.
 */
export function keysetOrder(columns: KeysetColumns): SQL[] {
    return [desc(columns.createdAt), desc(columns.id)];
}

/**
 * Creates a page of items from the given rows, which must already have been
 * sorted in `keysetOrder` and fetched with `limit + 1` so the extra row shows
 * whether there is a next page.
 *
 * @typeParam T - The row type; must have `createdAt` and `id`.
 * @param rows - Rows in `keysetOrder`, fetched with `limit + 1` so the extra
 *   row shows whether there is a next page.
 * @param limit - The page size the client asked for.
 * @returns The first `limit` rows, and a cursor for the last of them if more
 *   rows follow, otherwise `null`.
 * @throws {RangeError} If the last row's `createdAt` is an invalid `Date`.
 */
export function toPage<T extends KeysetRow>(rows: T[], limit: number): Page<T> {
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return {
        items,
        nextCursor: rows.length > limit && last ? encodeCursor(last) : null,
    };
}

function compareKeyset(a: KeysetRow, b: KeysetRow): number {
    return (
        b.createdAt.getTime() - a.createdAt.getTime() ||
        (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)
    );
}

export function paginateInMemory<T extends KeysetRow>(
    rows: T[],
    { limit, cursor }: PageParams,
): Page<T> {
    const sorted = rows.toSorted(compareKeyset);
    const remaining = cursor
        ? sorted.filter((row) => compareKeyset(row, cursor) > 0)
        : sorted;
    return toPage(remaining.slice(0, limit + 1), limit);
}
