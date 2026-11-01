export const MAX_APP_NAME = 63;

const RESERVED = new Set(["new"]);

export function appNameProblem(name: string) {
    if (name.length === 0) return "Enter a name";
    if (name.length > MAX_APP_NAME) {
        return `Use ${MAX_APP_NAME} characters or fewer`;
    }
    if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(name)) {
        return "Use lowercase letters, numbers and dashes, starting and ending with a letter or number";
    }
    if (RESERVED.has(name)) return "That name is reserved by quilt";
    return undefined;
}
