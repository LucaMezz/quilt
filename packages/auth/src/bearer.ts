import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

const DEVICE_TOKEN_PATH = "/device/token";

export function signDeviceTokens() {
    return {
        id: "sign-device-tokens",
        hooks: {
            after: [
                {
                    matcher: (ctx) => ctx.path === DEVICE_TOKEN_PATH,
                    handler: createAuthMiddleware(async (ctx) => {
                        const returned = ctx.context.returned;
                        if (
                            typeof returned !== "object" ||
                            returned === null ||
                            !("access_token" in returned) ||
                            typeof returned.access_token !== "string"
                        ) {
                            return;
                        }
                        const cookie = ctx.context.authCookies.sessionToken;
                        await ctx.setSignedCookie(
                            cookie.name,
                            returned.access_token,
                            ctx.context.secret,
                            cookie.attributes,
                        );
                    }),
                },
            ],
        },
    } satisfies BetterAuthPlugin;
}

export function hideBearerToken() {
    return {
        id: "hide-bearer-token",
        hooks: {
            after: [
                {
                    matcher: (ctx) => ctx.path !== DEVICE_TOKEN_PATH,
                    handler: createAuthMiddleware(async (ctx) => {
                        ctx.context.responseHeaders?.delete("set-auth-token");
                    }),
                },
            ],
        },
    } satisfies BetterAuthPlugin;
}
