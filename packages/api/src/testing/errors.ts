export function declaredError(code: string, status: number) {
    return { code, status, defined: true };
}
