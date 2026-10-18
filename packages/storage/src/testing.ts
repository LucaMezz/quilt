import {
    CreateBucketCommand,
    DeleteBucketCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import type { Storage } from "./index";

export async function createBucket(storage: Storage) {
    await storage.client.send(
        new CreateBucketCommand({ Bucket: storage.bucket }),
    );
}

export async function listKeys(storage: Storage) {
    const keys: string[] = [];
    let continuationToken: string | undefined;
    do {
        const page = await storage.client.send(
            new ListObjectsV2Command({
                Bucket: storage.bucket,
                ContinuationToken: continuationToken,
            }),
        );
        for (const { Key } of page.Contents ?? []) {
            if (Key) keys.push(Key);
        }
        continuationToken = page.NextContinuationToken;
    } while (continuationToken);
    return keys;
}

export async function emptyBucket(storage: Storage) {
    let continuationToken: string | undefined;
    do {
        const page = await storage.client.send(
            new ListObjectsV2Command({
                Bucket: storage.bucket,
                ContinuationToken: continuationToken,
            }),
        );
        const objects = (page.Contents ?? []).map(({ Key }) => ({ Key }));
        if (objects.length > 0) {
            await storage.client.send(
                new DeleteObjectsCommand({
                    Bucket: storage.bucket,
                    Delete: { Objects: objects, Quiet: true },
                }),
            );
        }
        continuationToken = page.NextContinuationToken;
    } while (continuationToken);
}

export async function dropBucket(storage: Storage) {
    await emptyBucket(storage);
    await storage.client.send(
        new DeleteBucketCommand({ Bucket: storage.bucket }),
    );
}
