import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useApiKey, useApiKeys, useDeleteApiKey } from "./use-api-keys";

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
});
