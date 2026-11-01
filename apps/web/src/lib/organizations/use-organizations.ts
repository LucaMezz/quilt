import { useCallback, useSyncExternalStore } from "react";

export type Role = "owner" | "admin" | "member";

export type Organization = {
    id: string;
    name: string;
    slug: string;
    role: Role;
};

const mockOrganizations: Organization[] = [
    { id: "org_7Hq2", name: "Acme", slug: "acme", role: "owner" },
    {
        id: "org_K9vD",
        name: "Side projects",
        slug: "side-projects",
        role: "admin",
    },
    {
        id: "org_3XmP",
        name: "Open source",
        slug: "open-source",
        role: "member",
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

export function useCreateOrganization() {
    return useCallback(({ name, slug }: { name: string; slug: string }) => {
        const organization: Organization = {
            id: `org_${crypto.randomUUID().slice(0, 4)}`,
            name,
            slug,
            role: "owner",
        };
        organizations = [...organizations, organization];
        for (const listener of listeners) listener();
        return organization;
    }, []);
}
