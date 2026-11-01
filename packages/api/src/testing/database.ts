import type { Database } from "@quilt/db";
import { sql } from "drizzle-orm";

export async function truncateAllTables(db: Database) {
    const { rows } = await db.execute<{ tablename: string }>(
        sql`select tablename from pg_tables where schemaname = 'public'`,
    );
    if (rows.length === 0) return;
    const tables = rows.map((row) => sql.identifier(row.tablename));
    await db.execute(
        sql`truncate table ${sql.join(tables, sql`, `)} restart identity cascade`,
    );
}
