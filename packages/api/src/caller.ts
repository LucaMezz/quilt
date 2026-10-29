import { type Auth, isAPIError } from "@quilt/auth";
import { API_KEY_HEADER } from "@quilt/auth/api-keys";

import type { Caller } from "./context";

export async function resolveCaller(
    auth: Auth,
    headers: Headers,
): Promise<Caller | null> {
    const session = await auth.api.getSession({ headers }).catch((error) => {
        if (isAPIError(error)) return null;
        throw error;
    });
    if (!session) return null;
    if (headers.has(API_KEY_HEADER)) {
        return {
            kind: "apiKey",
            userId: session.user.id,
            apiKeyId: session.session.id,
        };
    }
    return { kind: "session", userId: session.user.id, session };
}
