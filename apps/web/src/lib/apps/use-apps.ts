import { useCallback, useMemo, useSyncExternalStore } from "react";

export type AppStatus = "pending" | "running" | "sleeping" | "destroying";

export type App = {
    id: string;
    organization: string;
    name: string;
    hostname: string;
    status: AppStatus;
    liveDeployment: {
        version: number;
        image: string;
        deployedAt: Date;
    } | null;
    createdAt: Date;
};

export const APPS_DOMAIN = "apps.quilt.example";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function ago(milliseconds: number) {
    return new Date(Date.now() - milliseconds);
}

function app(
    organization: string,
    name: string,
    status: AppStatus,
    createdDaysAgo: number,
    live?: { version: number; image: string; hoursAgo: number },
): App {
    return {
        id: `app_${organization}_${name}`,
        organization,
        name,
        hostname: `${name}.${APPS_DOMAIN}`,
        status,
        liveDeployment: live
            ? {
                  version: live.version,
                  image: live.image,
                  deployedAt: ago(live.hoursAgo * HOUR),
              }
            : null,
        createdAt: ago(createdDaysAgo * DAY),
    };
}

const mockApps: App[] = [
    app("acme", "api", "running", 90, {
        version: 14,
        image: "ghcr.io/acme/api:2.3.1",
        hoursAgo: 3,
    }),
    app("acme", "web", "sleeping", 85, {
        version: 31,
        image: "ghcr.io/acme/web:main",
        hoursAgo: 50,
    }),
    app("acme", "billing-worker", "running", 30, {
        version: 4,
        image: "ghcr.io/acme/billing-worker:1.0.4",
        hoursAgo: 200,
    }),
    app("acme", "docs-preview", "pending", 1),
    app("side-projects", "blog", "sleeping", 400, {
        version: 9,
        image: "docker.io/ghost:5",
        hoursAgo: 900,
    }),
];

let apps = mockApps;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function snapshot() {
    return apps;
}

export function useApps(organization: string) {
    const all = useSyncExternalStore(subscribe, snapshot);
    return useMemo(
        () => all.filter((app) => app.organization === organization),
        [all, organization],
    );
}

export function useAppNameTaken() {
    const all = useSyncExternalStore(subscribe, snapshot);
    return useCallback(
        (name: string) => all.some((app) => app.name === name),
        [all],
    );
}

export function useCreateApp() {
    return useCallback(
        ({ organization, name }: { organization: string; name: string }) => {
            const created = app(organization, name, "pending", 0);
            apps = [...apps, created];
            for (const listener of listeners) listener();
            return created;
        },
        [],
    );
}
