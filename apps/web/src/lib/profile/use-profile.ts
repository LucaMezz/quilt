import { useCallback, useSyncExternalStore } from "react";

export type Profile = { name: string; email: string; image: string | null };

type SessionUser = { name: string; email: string; image?: string | null };

type Changes = { name?: string; image?: string | null };

let changes: Changes = {};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function setChanges(next: Changes) {
    changes = next;
    for (const listener of listeners) listener();
}

function snapshot() {
    return changes;
}

export function useProfile(user: SessionUser): Profile {
    const current = useSyncExternalStore(subscribe, snapshot);
    return {
        name: current.name ?? user.name,
        email: user.email,
        image:
            current.image === undefined ? (user.image ?? null) : current.image,
    };
}

export function useUpdateProfileName() {
    return useCallback((name: string) => {
        setChanges({ ...changes, name });
    }, []);
}

export function useSetProfileImage() {
    return useCallback((file: File | null) => {
        if (changes.image) URL.revokeObjectURL(changes.image);
        setChanges({
            ...changes,
            image: file ? URL.createObjectURL(file) : null,
        });
    }, []);
}
