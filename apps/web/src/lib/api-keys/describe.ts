import {
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

const RESOURCES = Object.keys(API_KEY_RESOURCES) as ApiKeyResource[];

export function grantedResources(permissions: ApiKeyPermissions) {
    return RESOURCES.filter(
        (resource) => accessLevel(permissions, resource) !== "none",
    );
}

export function ungrantedResources(permissions: ApiKeyPermissions) {
    return RESOURCES.filter(
        (resource) => accessLevel(permissions, resource) === "none",
    );
}

export function samePermissions(a: ApiKeyPermissions, b: ApiKeyPermissions) {
    return RESOURCES.every(
        (resource) => accessLevel(a, resource) === accessLevel(b, resource),
    );
}
