export const USER_CODE_LENGTH = 8;

export const USER_CODE_PATTERN = "^[A-HJ-NP-Za-hj-np-z2-9]+$";

export function normalizeUserCode(input: string) {
    return input
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, USER_CODE_LENGTH);
}

export function formatUserCode(code: string) {
    const half = USER_CODE_LENGTH / 2;
    const normalized = normalizeUserCode(code);
    if (normalized.length <= half) {
        return normalized;
    }
    return `${normalized.slice(0, half)}-${normalized.slice(half)}`;
}

export function isCompleteUserCode(code: string) {
    return (
        code.length === USER_CODE_LENGTH &&
        new RegExp(USER_CODE_PATTERN).test(code)
    );
}
