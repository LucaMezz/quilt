import { isDebugging, log } from "../ui/log";

export async function debugFetch(
    input: string | URL | Request,
    init?: RequestInit,
) {
    if (!isDebugging()) return fetch(input, init);

    const method =
        init?.method ?? (input instanceof Request ? input.method : "GET");
    const { pathname } = new URL(input instanceof Request ? input.url : input);
    const started = performance.now();
    const elapsed = () => `${Math.round(performance.now() - started)}ms`;
    try {
        const response = await fetch(input, init);
        log.debug(`${method} ${pathname} → ${response.status} in ${elapsed()}`);
        return response;
    } catch (error) {
        log.debug(
            `${method} ${pathname} failed after ${elapsed()}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
    }
}
