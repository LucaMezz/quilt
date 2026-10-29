export const DEFAULT_REDIRECT = "/dashboard";

export function safeRedirect(target: unknown) {
    if (
        typeof target !== "string" ||
        !target.startsWith("/") ||
        target.startsWith("//") ||
        target.startsWith("/\\")
    ) {
        return DEFAULT_REDIRECT;
    }
    return target;
}
