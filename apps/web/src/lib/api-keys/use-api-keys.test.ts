import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    useApiKey,
    useApiKeys,
    useDeleteApiKey,
    useRegenerateApiKey,
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
});
