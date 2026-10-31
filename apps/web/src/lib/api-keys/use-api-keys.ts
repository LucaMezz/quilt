import type { ApiKeyPermissions } from "@quilt/auth/permissions";
import { useCallback, useSyncExternalStore } from "react";

export type ApiKey = {
    id: string;
    name: string | null;
    start: string | null;
    enabled: boolean;
    expiresAt: Date | null;
    lastRequest: Date | null;
    createdAt: Date;
    permissions: ApiKeyPermissions;
};

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number) {
    return new Date(Date.now() + days * DAY);
}

const mockKeys: ApiKey[] = [
    {
        id: "Ib60rb3kQm2VtX8pLs4N1aZcYw7Ue5Hd",
        name: "quilt CLI",
        start: "qlt_Ib",
        enabled: true,
        expiresAt: daysFromNow(83),
        lastRequest: daysFromNow(-0.1),
        createdAt: daysFromNow(-7),
        permissions: {
            organizations: ["read", "write"],
            apps: ["read", "write"],
            apiKeys: ["read", "write"],
            user: ["read", "write"],
        },
    },
    {
        id: "NbL55QdT9wRk2HsE6mZyPc3Vx8Ga1JfU",
        name: "grafana dashboard",
        start: "qlt_Nb",
        enabled: true,
        expiresAt: daysFromNow(4),
        lastRequest: daysFromNow(-1),
        createdAt: daysFromNow(-86),
        permissions: { organizations: ["read"], apps: ["read"] },
    },
    {
        id: "0C7JxCoNhHUgWwS0WVZbRHN2volNTjOJ",
        name: "github actions",
        start: "qlt_0C",
        enabled: false,
        expiresAt: daysFromNow(200),
        lastRequest: daysFromNow(-12),
        createdAt: daysFromNow(-40),
        permissions: { apps: ["read", "write"] },
    },
    {
        id: "Zz9yXw8vRt6Qp4Lm2Kj0Hg7Fd5Sa3Bn1",
        name: "old laptop",
        start: "qlt_Zz",
        enabled: true,
        expiresAt: daysFromNow(-3),
        lastRequest: daysFromNow(-95),
        createdAt: daysFromNow(-93),
        permissions: { user: ["read"] },
    },
];

let keys = mockKeys;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function setKeys(next: ApiKey[]) {
    keys = next;
    for (const listener of listeners) listener();
}

function snapshot() {
    return keys;
}

export function useApiKeys(): { keys: ApiKey[] } {
    return { keys: useSyncExternalStore(subscribe, snapshot) };
}

export function useApiKey(id: string): ApiKey | undefined {
    return useApiKeys().keys.find((key) => key.id === id);
}

export function useDeleteApiKey() {
    return useCallback((id: string) => {
        setKeys(keys.filter((key) => key.id !== id));
    }, []);
}
