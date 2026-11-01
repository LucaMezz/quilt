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
