import { createDb } from "@quilt/db";
import { user } from "@quilt/db/schema/auth";
import { sql } from "drizzle-orm";
import { test as baseTest, inject } from "vitest";

import "./environment";

export const test = baseTest
    .extend("databaseUrl", { scope: "worker" }, () => inject("databaseUrl"))
    .extend("db", { scope: "worker" }, ({ databaseUrl }, { onCleanup }) => {
        const db = createDb({ DATABASE_URL: databaseUrl });
        onCleanup(() => db.$client.end());
        return db;
    })
    .extend("resetDb", { auto: true }, async ({ db }) => {
        const { rows } = await db.execute<{ tablename: string }>(
            sql`select tablename from pg_tables where schemaname = 'public'`,
        );
        if (rows.length === 0) return;
        const tables = rows.map((row) => sql.identifier(row.tablename));
        await db.execute(
            sql`truncate table ${sql.join(tables, sql`, `)} restart identity cascade`,
        );
    })
    .extend("createUser", ({ db }) => async (name = "user") => {
        const id = crypto.randomUUID();
        const [created] = await db
            .insert(user)
            .values({ id, name, email: `${name}-${id}@example.com` })
            .returning();
        if (!created) throw new Error("Insert returned no row");
        return created;
    });
