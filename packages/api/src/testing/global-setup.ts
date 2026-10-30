import "varlock/auto-load";

import { randomBytes } from "node:crypto";

import { createDb } from "@quilt/db";
import { migrateDb } from "@quilt/db/migrate";
import { createDatabase, dropDatabase } from "@quilt/db/testing";
import { closeStorage, createStorage } from "@quilt/storage";
import type { StorageConfig } from "@quilt/storage/config";
import { createBucket, dropBucket } from "@quilt/storage/testing";
import type { TestProject } from "vitest/node";

import { ENV } from "#/env";
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

    const storageConfig: StorageConfig = {
        STORAGE_ENDPOINT: ENV.TEST_STORAGE_ENDPOINT,
        STORAGE_REGION: "us-east-1",
        STORAGE_BUCKET: name.replaceAll("_", "-"),
        STORAGE_FORCE_PATH_STYLE: true,
        STORAGE_ACCESS_KEY_ID: ENV.TEST_STORAGE_ACCESS_KEY_ID,
        STORAGE_SECRET_ACCESS_KEY: ENV.TEST_STORAGE_SECRET_ACCESS_KEY,
    };
    const storage = createStorage(storageConfig);
    try {
        await createBucket(storage);
    } catch (error) {
        closeStorage(storage);
        await dropDatabase(adminUrl, name);
        throw error;
    }

    project.provide("databaseUrl", databaseUrl);
    project.provide("storageConfig", storageConfig);

    return async () => {
        await dropBucket(storage);
        closeStorage(storage);
        await dropDatabase(adminUrl, name);
    };
}
