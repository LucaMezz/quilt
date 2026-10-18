import {
    DeleteObjectCommand,
    GetObjectCommand,
    NoSuchKey,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

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

export function closeStorage(storage: Storage) {
    storage.client.destroy();
}

export async function putObject(
    storage: Storage,
    key: string,
    body: Uint8Array,
    contentType: string,
) {
    await storage.client.send(
        new PutObjectCommand({
            Bucket: storage.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        }),
    );
}

export type StoredObject = {
    body: Uint8Array;
    contentType: string | undefined;
};

export async function getObject(
    storage: Storage,
    key: string,
): Promise<StoredObject | null> {
    try {
        const object = await storage.client.send(
            new GetObjectCommand({ Bucket: storage.bucket, Key: key }),
        );
        return {
            body:
                (await object.Body?.transformToByteArray()) ?? new Uint8Array(),
            contentType: object.ContentType,
        };
    } catch (error) {
        if (error instanceof NoSuchKey) return null;
        throw error;
    }
}

export async function deleteObject(storage: Storage, key: string) {
    await storage.client.send(
        new DeleteObjectCommand({ Bucket: storage.bucket, Key: key }),
    );
}
