import { describe, expect } from "vitest";

import { PageInput } from "../pagination";
import { test } from "../testing/fixtures";
import {
    ApiKeyNotFoundError,
    deleteApiKey,
    getApiKey,
    listApiKeys,
    updateApiKey,
} from "./api-keys";

describe("listApiKeys", () => {
    test("pages through only the caller's keys", async ({ auth, signUp }) => {
        const caller = await signUp("caller");
        const other = await signUp("other");
        const created = [];
        for (const name of ["first", "second", "third"]) {
            created.push(
                await auth.api.createApiKey({
                    body: { name },
                    headers: caller.headers,
                }),
            );
        }
        await auth.api.createApiKey({
            body: { name: "not-mine" },
            headers: other.headers,
        });

        const first = await listApiKeys(
            auth,
            caller.headers,
            PageInput.parse({ limit: 2 }),
        );
        const second = await listApiKeys(
            auth,
            caller.headers,
            PageInput.parse({ limit: 2, cursor: first.nextCursor }),
        );

        const listed = [...first.items, ...second.items].map((key) => key.id);
        expect(listed).toHaveLength(3);
        expect(new Set(listed)).toEqual(new Set(created.map((key) => key.id)));
        expect(second.nextCursor).toBeNull();
        expect(first.items[0]).not.toHaveProperty("key");
    });
});

describe("getApiKey, updateApiKey and deleteApiKey", () => {
    test("act on the caller's own key", async ({ auth, signUp }) => {
        const caller = await signUp();
        const created = await auth.api.createApiKey({
            body: { name: "cli" },
            headers: caller.headers,
        });

        const updated = await updateApiKey(auth, caller.headers, created.id, {
            name: "ci",
            enabled: false,
        });
        const fetched = await getApiKey(auth, caller.headers, created.id);
        const deleted = await deleteApiKey(auth, caller.headers, created.id);

        expect(updated).toMatchObject({ name: "ci", enabled: false });
        expect(fetched).toMatchObject({ id: created.id, name: "ci" });
        expect(deleted.id).toBe(created.id);
        await expect(
            getApiKey(auth, caller.headers, created.id),
        ).rejects.toBeInstanceOf(ApiKeyNotFoundError);
    });

    test("treat another user's key as not found", async ({ auth, signUp }) => {
        const owner = await signUp("owner");
        const caller = await signUp("caller");
        const created = await auth.api.createApiKey({
            body: { name: "owner-key" },
            headers: owner.headers,
        });

        await expect(
            getApiKey(auth, caller.headers, created.id),
        ).rejects.toBeInstanceOf(ApiKeyNotFoundError);
        await expect(
            updateApiKey(auth, caller.headers, created.id, { enabled: false }),
        ).rejects.toBeInstanceOf(ApiKeyNotFoundError);
        await expect(
            deleteApiKey(auth, caller.headers, created.id),
        ).rejects.toBeInstanceOf(ApiKeyNotFoundError);
        await expect(
            getApiKey(auth, owner.headers, created.id),
        ).resolves.toMatchObject({ enabled: true });
    });

    test("report a key that never existed as not found", async ({
        auth,
        signUp,
    }) => {
        const caller = await signUp();

        await expect(
            updateApiKey(auth, caller.headers, "missing", { name: "x" }),
        ).rejects.toBeInstanceOf(ApiKeyNotFoundError);
        await expect(
            deleteApiKey(auth, caller.headers, "missing"),
        ).rejects.toBeInstanceOf(ApiKeyNotFoundError);
    });
});
