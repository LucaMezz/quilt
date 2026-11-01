import { API_KEY_PREFIX } from "@quilt/auth/api-keys";
import type { ApiKeyPermissions } from "@quilt/auth/permissions";
import { useCallback, useSyncExternalStore } from "react";

export type ApiKey = {
    id: string;
    name: string | null;
    description: string | null;
    start: string | null;
    enabled: boolean;
    expiresAt: Date | null;
    lastRequest: Date | null;
    createdAt: Date;
    organizations: OrganizationAccess;
    permissions: ApiKeyPermissions;
};

type OrganizationAccess = "all" | string[];

export type NewApiKey = {
    name: string;
    description: string | null;
    expiresInDays: number;
    organizations: OrganizationAccess;
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
        description: "Created by quilt login on this laptop.",
        start: "qlt_Ib",
        enabled: true,
        expiresAt: daysFromNow(83),
        lastRequest: daysFromNow(-0.1),
        createdAt: daysFromNow(-7),
        organizations: "all",
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
        description: "Read-only access for the status board in the office.",
        start: "qlt_Nb",
        enabled: true,
        expiresAt: daysFromNow(4),
        lastRequest: daysFromNow(-1),
        createdAt: daysFromNow(-86),
        organizations: "all",
        permissions: { organizations: ["read"], apps: ["read"] },
    },
    {
        id: "0C7JxCoNhHUgWwS0WVZbRHN2volNTjOJ",
        name: "github actions",
        description: "Deploys apps from the main branch of the website repo.",
        start: "qlt_0C",
        enabled: false,
        expiresAt: daysFromNow(200),
        lastRequest: daysFromNow(-12),
        createdAt: daysFromNow(-40),
        organizations: "all",
        permissions: { apps: ["read", "write"] },
    },
    {
        id: "Zz9yXw8vRt6Qp4Lm2Kj0Hg7Fd5Sa3Bn1",
        name: "old laptop",
        description: null,
        start: "qlt_Zz",
        enabled: true,
        expiresAt: daysFromNow(-3),
        lastRequest: daysFromNow(-95),
        createdAt: daysFromNow(-93),
        organizations: "all",
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

const KEY_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function newSecret() {
    const bytes = crypto.getRandomValues(new Uint8Array(64));
    const body = Array.from(
        bytes,
        (byte) => KEY_ALPHABET[byte % KEY_ALPHABET.length],
    ).join("");
    return `${API_KEY_PREFIX}${body}`;
}

export function useRegenerateApiKey() {
    return useCallback((id: string, expiresInDays: number) => {
        const secret = newSecret();
        setKeys(
            keys.map((key) =>
                key.id === id
                    ? {
                          ...key,
                          start: secret.slice(0, API_KEY_PREFIX.length + 2),
                          expiresAt: daysFromNow(expiresInDays),
                          lastRequest: null,
                      }
                    : key,
            ),
        );
        return secret;
    }, []);
}

export function useUpdateApiKeyPermissions() {
    return useCallback((id: string, permissions: ApiKeyPermissions) => {
        setKeys(
            keys.map((key) => (key.id === id ? { ...key, permissions } : key)),
        );
    }, []);
}

function newId() {
    return newSecret().slice(API_KEY_PREFIX.length, API_KEY_PREFIX.length + 32);
}

export function useCreateApiKey() {
    return useCallback(({ expiresInDays, ...details }: NewApiKey) => {
        const secret = newSecret();
        const id = newId();
        setKeys([
            {
                ...details,
                id,
                start: secret.slice(0, API_KEY_PREFIX.length + 2),
                enabled: true,
                expiresAt: daysFromNow(expiresInDays),
                lastRequest: null,
                createdAt: new Date(),
            },
            ...keys,
        ]);
        return { id, secret };
    }, []);
}
