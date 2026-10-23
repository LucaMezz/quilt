import type { Auth } from "@quilt/auth";

import type { Caller } from "./context";

export async function resolveCaller(
    auth: Auth,
    headers: Headers,
): Promise<Caller | null> {
    const session = await auth.api.getSession({ headers });
    if (!session) return null;
    return { kind: "session", userId: session.user.id, session };
}
