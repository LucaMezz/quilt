import {
    type AccessLevel,
    API_KEY_RESOURCES,
    type ApiKeyPermissions,
    type ApiKeyResource,
    accessLevel,
} from "@quilt/auth/permissions";

const EXPIRES_SOON_WITHIN = 7 * 24 * 60 * 60 * 1000;

type KeyState = { enabled: boolean; expiresAt: Date | null };

export type KeyStatus = "active" | "disabled" | "expired";

export function keyStatus(key: KeyState, now = new Date()): KeyStatus {
    if (key.expiresAt && key.expiresAt <= now) return "expired";
    if (!key.enabled) return "disabled";
    return "active";
}

export function expiresSoon(key: KeyState, now = new Date()) {
    if (!key.expiresAt || key.expiresAt <= now) return false;
    return key.expiresAt.getTime() - now.getTime() <= EXPIRES_SOON_WITHIN;
}

const resources = Object.keys(API_KEY_RESOURCES) as ApiKeyResource[];

export function accessSummary(permissions: ApiKeyPermissions): AccessLevel {
    const levels = resources.map((resource) =>
        accessLevel(permissions, resource),
    );
    if (levels.includes("write")) return "write";
    if (levels.includes("read")) return "read";
    return "none";
}

export function writableResources(permissions: ApiKeyPermissions) {
    return resources
        .filter((resource) => accessLevel(permissions, resource) === "write")
        .map((resource) => API_KEY_RESOURCES[resource].label);
}
