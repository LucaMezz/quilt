import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { afterAll, describe, expect, inject, test } from "vitest";

import { createStorage, deleteObject, putObject } from "./index";
import { emptyBucket } from "./testing";

const storage = createStorage(inject("storageConfig"));
afterAll(() => storage.client.destroy());

function listKeys() {
    return storage.client
        .send(new ListObjectsV2Command({ Bucket: storage.bucket }))
        .then((page) => (page.Contents ?? []).map(({ Key }) => Key));
}

describe("storage", () => {
    test("reads back an object it stored", async () => {
        await storage.client.send(
            new PutObjectCommand({
                Bucket: storage.bucket,
                Key: "greetings/hello.txt",
                Body: "hello quilt",
                ContentType: "text/plain",
            }),
        );

        const object = await storage.client.send(
            new GetObjectCommand({
                Bucket: storage.bucket,
                Key: "greetings/hello.txt",
            }),
        );

        expect(object.ContentType).toBe("text/plain");
        await expect(object.Body?.transformToString()).resolves.toBe(
            "hello quilt",
        );
    });

    test("emptyBucket removes every object", async () => {
        for (const key of ["a.txt", "nested/b.txt", "nested/deeper/c.txt"]) {
            await storage.client.send(
                new PutObjectCommand({
                    Bucket: storage.bucket,
                    Key: key,
                    Body: key,
                }),
            );
        }

        await emptyBucket(storage);

        await expect(listKeys()).resolves.toEqual([]);
    });

    test("putObject stores an object that deleteObject removes", async () => {
        await putObject(
            storage,
            "helpers/bytes.bin",
            new Uint8Array([1, 2, 3]),
            "application/octet-stream",
        );

        const object = await storage.client.send(
            new GetObjectCommand({
                Bucket: storage.bucket,
                Key: "helpers/bytes.bin",
            }),
        );
        expect(object.ContentType).toBe("application/octet-stream");
        await expect(object.Body?.transformToByteArray()).resolves.toEqual(
            new Uint8Array([1, 2, 3]),
        );

        await deleteObject(storage, "helpers/bytes.bin");

        await expect(listKeys()).resolves.not.toContain("helpers/bytes.bin");
    });
});
