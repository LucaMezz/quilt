import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { afterAll, describe, expect, inject, test } from "vitest";

import {
    closeStorage,
    createStorage,
    deleteObject,
    getObject,
    putObject,
} from "./index";
import { emptyBucket, listKeys } from "./testing";

const storage = createStorage(inject("storageConfig"));
afterAll(() => closeStorage(storage));

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
            await putObject(
                storage,
                key,
                new TextEncoder().encode(key),
                "text/plain",
            );
        }

        await emptyBucket(storage);

        await expect(listKeys(storage)).resolves.toEqual([]);
    });

    test("listKeys returns every key across pages", async () => {
        const keys = Array.from(
            { length: 1005 },
            (_, index) => `many/${String(index).padStart(4, "0")}`,
        );
        for (let start = 0; start < keys.length; start += 50) {
            await Promise.all(
                keys
                    .slice(start, start + 50)
                    .map((key) =>
                        putObject(
                            storage,
                            key,
                            new Uint8Array(),
                            "application/octet-stream",
                        ),
                    ),
            );
        }

        const listed = await listKeys(storage);

        expect(listed.sort()).toEqual(keys);
        await emptyBucket(storage);
    }, 30_000);

    test("getObject reads back what putObject stored", async () => {
        await putObject(
            storage,
            "helpers/bytes.bin",
            new Uint8Array([1, 2, 3]),
            "application/octet-stream",
        );

        await expect(getObject(storage, "helpers/bytes.bin")).resolves.toEqual({
            body: new Uint8Array([1, 2, 3]),
            contentType: "application/octet-stream",
        });
    });

    test("getObject returns null for a missing key", async () => {
        await expect(getObject(storage, "helpers/missing.bin")).resolves.toBe(
            null,
        );
    });

    test("deleteObject removes an object", async () => {
        await putObject(
            storage,
            "helpers/doomed.bin",
            new Uint8Array([1]),
            "application/octet-stream",
        );

        await deleteObject(storage, "helpers/doomed.bin");

        await expect(getObject(storage, "helpers/doomed.bin")).resolves.toBe(
            null,
        );
    });
});
