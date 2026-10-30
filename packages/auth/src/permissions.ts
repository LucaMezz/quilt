export const API_KEY_RESOURCES = {
    organizations: {
        label: "Organizations",
        description: "View, create, rename and delete your organizations.",
    },
    apps: {
        label: "Apps",
        description: "View, create and destroy apps in your organizations.",
    },
    apiKeys: {
        label: "API keys",
        description: "View, create, change and delete your API keys.",
    },
    user: {
        label: "Profile",
        description: "View and change your name and profile picture.",
    },
} as const satisfies Record<string, { label: string; description: string }>;

export type ApiKeyResource = keyof typeof API_KEY_RESOURCES;

const API_KEY_ACTIONS = ["read", "write"] as const;

type ApiKeyAction = (typeof API_KEY_ACTIONS)[number];

export type ApiKeyPermissions = Partial<Record<ApiKeyResource, ApiKeyAction[]>>;

export const apiKeyStatements = Object.fromEntries(
    Object.keys(API_KEY_RESOURCES).map((resource) => [
        resource,
        API_KEY_ACTIONS,
    ]),
) as Record<ApiKeyResource, typeof API_KEY_ACTIONS>;

export const ACCESS_LEVELS = ["none", "read", "write"] as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const ACCESS_LEVEL_LABELS = {
    none: "No access",
    read: "Read-only",
    write: "Read and write",
} as const satisfies Record<AccessLevel, string>;

const ACTIONS_FOR_LEVEL = {
    none: [],
    read: ["read"],
    write: ["read", "write"],
} as const satisfies Record<AccessLevel, readonly ApiKeyAction[]>;

export function accessLevel(
    permissions: ApiKeyPermissions,
    resource: ApiKeyResource,
): AccessLevel {
    const actions = permissions[resource] ?? [];
    if (actions.includes("write")) return "write";
    if (actions.includes("read")) return "read";
    return "none";
}

export function withAccessLevel(
    permissions: ApiKeyPermissions,
    resource: ApiKeyResource,
    level: AccessLevel,
): ApiKeyPermissions {
    const { [resource]: _previous, ...others } = permissions;
    if (level === "none") return others;
    return { ...others, [resource]: [...ACTIONS_FOR_LEVEL[level]] };
}
