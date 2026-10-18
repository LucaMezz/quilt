import "varlock/auto-load";

import { randomBytes } from "node:crypto";

import type { TestProject } from "vitest/node";

import type { StorageConfig } from "../config";
import { ENV } from "../env";
import { createStorage } from "../index";
import { createBucket, dropBucket } from "../testing";
import "./environment";

export default async function setup(project: TestProject) {
    const config: StorageConfig = {
        STORAGE_ENDPOINT: ENV.TEST_STORAGE_ENDPOINT,
        STORAGE_REGION: "us-east-1",
        STORAGE_BUCKET: `quilt-integration-${randomBytes(4).toString("hex")}`,
        STORAGE_FORCE_PATH_STYLE: true,
        STORAGE_ACCESS_KEY_ID: ENV.TEST_STORAGE_ACCESS_KEY_ID,
        STORAGE_SECRET_ACCESS_KEY: ENV.TEST_STORAGE_SECRET_ACCESS_KEY,
    };
    const storage = createStorage(config);
    await createBucket(storage);

    project.provide("storageConfig", config);

    return async () => {
        await dropBucket(storage);
        storage.client.destroy();
    };
}
