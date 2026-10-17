import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import type { Database } from "./index";

const migrationsFolder = fileURLToPath(
    new URL("./migrations", import.meta.url),
);

export async function migrateDb(db: Database) {
    await migrate(db, { migrationsFolder });
}
