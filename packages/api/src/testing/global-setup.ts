import "varlock/auto-load";

import { randomBytes } from "node:crypto";

import { createDb } from "@quilt/db";
import { migrateDb } from "@quilt/db/migrate";
import { createDatabase, dropDatabase } from "@quilt/db/testing";
import type { TestProject } from "vitest/node";

import { ENV } from "../env";
import "./environment";

export default async function setup(project: TestProject) {
    const adminUrl = ENV.TEST_DATABASE_URL;
    const name = `quilt_integration_${randomBytes(4).toString("hex")}`;
    const databaseUrl = await createDatabase(adminUrl, name);

    const db = createDb({ DATABASE_URL: databaseUrl });
    try {
        await migrateDb(db);
    } catch (error) {
        await db.$client.end();
        await dropDatabase(adminUrl, name);
        throw error;
    }
    await db.$client.end();

    project.provide("databaseUrl", databaseUrl);

    return () => dropDatabase(adminUrl, name);
}
