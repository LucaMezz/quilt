import type { Auth } from "@quilt/auth";
import { API_KEY_HEADER } from "@quilt/auth/api-keys";

import type { Caller } from "./context";

export async function resolveCaller(
    auth: Auth,
    headers: Headers,
): Promise<Caller | null> {
    const key = headers.get(API_KEY_HEADER);
    if (key !== null) {
        const { valid, key: apiKey } = await auth.api.verifyApiKey({
            body: { key },
        });
        if (!valid || !apiKey) return null;
        return {
            kind: "apiKey",
            userId: apiKey.referenceId,
            apiKeyId: apiKey.id,
        };
    }
    const session = await auth.api.getSession({ headers });
    if (!session) return null;
    return { kind: "session", userId: session.user.id, session };
}
