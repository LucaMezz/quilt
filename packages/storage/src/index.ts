import { S3Client } from "@aws-sdk/client-s3";

import type { StorageConfig } from "./config";

function resolveCredentials(env: StorageConfig) {
    const accessKeyId = env.STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = env.STORAGE_SECRET_ACCESS_KEY;
    if (!accessKeyId && !secretAccessKey) return undefined;
    if (!accessKeyId || !secretAccessKey) {
        throw new Error(
            "Set both STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY, or neither",
        );
    }
    return { accessKeyId, secretAccessKey };
}

export function createStorage(env: StorageConfig) {
    const client = new S3Client({
        region: env.STORAGE_REGION,
        endpoint: env.STORAGE_ENDPOINT,
        forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
        credentials: resolveCredentials(env),
        ...(env.STORAGE_ENDPOINT && {
            requestChecksumCalculation: "WHEN_REQUIRED",
            responseChecksumValidation: "WHEN_REQUIRED",
        }),
    });
    return { client, bucket: env.STORAGE_BUCKET };
}

export type Storage = ReturnType<typeof createStorage>;
