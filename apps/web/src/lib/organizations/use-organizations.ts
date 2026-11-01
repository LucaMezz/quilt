import { useCallback, useSyncExternalStore } from "react";

import { moveApps } from "@/lib/apps/use-apps";

export type Role = "owner" | "admin" | "member";

export type Organization = {
    id: string;
    name: string;
    slug: string;
    role: Role;
    createdAt: Date;
};

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
    return new Date(Date.now() - days * DAY);
}

const mockOrganizations: Organization[] = [
    {
        id: "org_7Hq2",
        name: "Acme",
        slug: "acme",
        role: "owner",
        createdAt: daysAgo(120),
    },
    {
        id: "org_K9vD",
        name: "Side projects",
        slug: "side-projects",
        role: "admin",
        createdAt: daysAgo(400),
    },
    {
        id: "org_3XmP",
        name: "Open source",
        slug: "open-source",
        role: "member",
        createdAt: daysAgo(30),
    },
];

let organizations = mockOrganizations;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function snapshot() {
    return organizations;
}

export function useOrganizations() {
    return useSyncExternalStore(subscribe, snapshot);
}

export function useOrganization(slug: string) {
    return useOrganizations().find(
        (organization) => organization.slug === slug,
    );
}

export function useCreateOrganization() {
    return useCallback(({ name, slug }: { name: string; slug: string }) => {
        const organization: Organization = {
            id: `org_${crypto.randomUUID().slice(0, 4)}`,
            name,
            slug,
            role: "owner",
            createdAt: new Date(),
        };
        organizations = [...organizations, organization];
        for (const listener of listeners) listener();
        return organization;
    }, []);
}

export function canManageOrganization(organization: Organization) {
    return organization.role !== "member";
}

export function useUpdateOrganization() {
    return useCallback(
        (id: string, changes: { name: string; slug: string }) => {
            const current = organizations.find(
                (organization) => organization.id === id,
            );
            if (!current) return;
            organizations = organizations.map((organization) =>
                organization.id === id
                    ? { ...organization, ...changes }
                    : organization,
            );
            if (changes.slug !== current.slug) {
                moveApps(current.slug, changes.slug);
            }
            for (const listener of listeners) listener();
        },
        [],
    );
}
