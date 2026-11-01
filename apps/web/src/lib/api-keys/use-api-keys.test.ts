import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    useApiKey,
    useApiKeys,
    useCreateApiKey,
    useDeleteApiKey,
    useRegenerateApiKey,
    useUpdateApiKeyPermissions,
} from "./use-api-keys";

describe("API key store", () => {
    it("finds a key by its ID", () => {
        const { result } = renderHook(() => useApiKeys());
        const [first] = result.current.keys;
        if (!first) throw new Error("No mock keys");

        const { result: found } = renderHook(() => useApiKey(first.id));

        expect(found.current).toBe(first);
    });

    it("removes a deleted key from every view", () => {
        const { result } = renderHook(() => ({
            keys: useApiKeys().keys,
            deleteKey: useDeleteApiKey(),
        }));
        const [first] = result.current.keys;
        if (!first) throw new Error("No mock keys");
        const { result: found } = renderHook(() => useApiKey(first.id));
        const before = result.current.keys.length;

        act(() => result.current.deleteKey(first.id));

        expect(result.current.keys).toHaveLength(before - 1);
        expect(found.current).toBeUndefined();
    });

    it("gives a key a new secret and expiration but keeps everything else", () => {
        const { result } = renderHook(() => ({
            keys: useApiKeys().keys,
            regenerate: useRegenerateApiKey(),
        }));
        const [first] = result.current.keys;
        if (!first) throw new Error("No mock keys");

        let secret = "";
        act(() => {
            secret = result.current.regenerate(first.id, 30);
        });
        const updated = result.current.keys.find((key) => key.id === first.id);

        expect(secret).toMatch(/^qlt_[A-Za-z0-9]{64}$/);
        expect(updated?.start).toBe(secret.slice(0, 6));
        expect(updated?.start).not.toBe(first.start);
        expect(updated?.lastRequest).toBeNull();
        expect(updated?.expiresAt?.getTime()).toBeGreaterThan(
            Date.now() + 29 * 24 * 60 * 60 * 1000,
        );
        expect(updated).toMatchObject({
            name: first.name,
            description: first.description,
            permissions: first.permissions,
        });
    });

    it("replaces a key's permissions and nothing else", () => {
        const { result } = renderHook(() => ({
            keys: useApiKeys().keys,
            update: useUpdateApiKeyPermissions(),
        }));
        const [first] = result.current.keys;
        if (!first) throw new Error("No mock keys");

        act(() => result.current.update(first.id, { apps: ["read"] }));

        expect(result.current.keys.find((key) => key.id === first.id)).toEqual({
            ...first,
            permissions: { apps: ["read"] },
        });
    });

    it("adds a created key first and returns its only copy of the secret", () => {
        const { result } = renderHook(() => ({
            keys: useApiKeys().keys,
            create: useCreateApiKey(),
        }));

        let created = { id: "", secret: "" };
        act(() => {
            created = result.current.create({
                name: "ci",
                description: null,
                expiresInDays: 7,
                organizations: ["org_7Hq2"],
                permissions: { apps: ["read"] },
            });
        });
        const [first] = result.current.keys;

        expect(created.secret).toMatch(/^qlt_[A-Za-z0-9]{64}$/);
        expect(first).toMatchObject({
            id: created.id,
            name: "ci",
            start: created.secret.slice(0, 6),
            enabled: true,
            lastRequest: null,
            organizations: ["org_7Hq2"],
            permissions: { apps: ["read"] },
        });
        expect(first?.expiresAt?.getTime()).toBeGreaterThan(
            Date.now() + 6 * 24 * 60 * 60 * 1000,
        );
    });
});
