import { and, desc, eq, lt, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

type KeysetRow = {
    createdAt: Date;
    id: string;
};

type KeysetColumns = {
    createdAt: PgColumn;
    id: PgColumn;
};

const CursorPayload = z.object({
    createdAt: z.iso.datetime(),
    id: z.string().min(1),
});

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

export type PageParams = z.output<typeof PageInput>;

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

export type Page<T> = {
    items: T[];
    nextCursor: string | null;
};

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

export function keysetOrder(columns: KeysetColumns): SQL[] {
    return [desc(columns.createdAt), desc(columns.id)];
}

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
