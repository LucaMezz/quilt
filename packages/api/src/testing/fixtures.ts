import { type Auth, createAuth } from "@quilt/auth";
import { createDb, type Database } from "@quilt/db";
import { member, organization, user } from "@quilt/db/schema/auth";
import { closeStorage, createStorage, type Storage } from "@quilt/storage";
import { emptyBucket } from "@quilt/storage/testing";
import { sql } from "drizzle-orm";
import { test as baseTest, inject } from "vitest";

import { resolveCaller } from "#/caller";
import type { Context } from "#/context";
import "./environment";

export const test = baseTest
    .extend("databaseUrl", { scope: "worker" }, () => inject("databaseUrl"))
    .extend(
        "db",
        { scope: "worker" },
        ({ databaseUrl }, { onCleanup }): Database => {
            const db = createDb({ DATABASE_URL: databaseUrl });
            onCleanup(() => db.$client.end());
            return db;
        },
    )
    .extend("storageConfig", { scope: "worker" }, () => inject("storageConfig"))
    .extend(
        "storage",
        { scope: "worker" },
        ({ storageConfig }, { onCleanup }): Storage => {
            const storage = createStorage(storageConfig);
            onCleanup(() => closeStorage(storage));
            return storage;
        },
    )
    .extend("resetStorage", { auto: true }, ({ storage }) =>
        emptyBucket(storage),
    )
    .extend(
        "auth",
        { scope: "worker" },
        ({ db }): Auth =>
            createAuth(
                {
                    BETTER_AUTH_URL: "http://localhost:3000",
                    BETTER_AUTH_SECRET:
                        "integration-test-secret-integration-test",
                    CORS_ORIGIN: "http://localhost:3001",
                },
                db,
            ),
    )
    .extend(
        "contextFor",
        ({ auth, db, storage }) =>
            async (headers: Headers): Promise<Context> => ({
                auth,
                db,
                storage,
                headers,
                appsDomain: "example.com",
                caller: await resolveCaller(auth, headers),
            }),
    )
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
    })
    .extend("signUp", ({ auth }) => async (name = "user") => {
        const { headers, response } = await auth.api.signUpEmail({
            body: {
                name,
                email: `${name}-${crypto.randomUUID()}@example.com`,
                password: "integration-password",
            },
            returnHeaders: true,
        });
        const cookie = headers
            .getSetCookie()
            .map((setCookie) => setCookie.split(";")[0])
            .join("; ");
        const sessionHeaders: Headers = new Headers({ cookie });
        return { user: response.user, headers: sessionHeaders };
    })
    .extend(
        "createOrganization",
        ({ db, createUser }) =>
            async (slug = "acme") => {
                const owner = await createUser(`${slug}-owner`);
                const [created] = await db
                    .insert(organization)
                    .values({
                        id: crypto.randomUUID(),
                        name: slug,
                        slug,
                        createdAt: new Date(),
                    })
                    .returning();
                if (!created) throw new Error("Insert returned no row");
                await db.insert(member).values({
                    id: crypto.randomUUID(),
                    organizationId: created.id,
                    userId: owner.id,
                    role: "owner",
                    createdAt: new Date(),
                });
                return { organization: created, owner };
            },
    );
