import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

export function hideBearerToken() {
    return {
        id: "hide-bearer-token",
        hooks: {
            after: [
                {
                    matcher: () => true,
                    handler: createAuthMiddleware(async (ctx) => {
                        ctx.context.responseHeaders?.delete("set-auth-token");
                    }),
                },
            ],
        },
    } satisfies BetterAuthPlugin;
}
