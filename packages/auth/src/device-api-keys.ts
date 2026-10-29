import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

const CLI_API_KEY_NAME = "quilt CLI";
const CLI_API_KEY_EXPIRES_IN = 90 * 24 * 60 * 60;

type CreateApiKey = (body: {
    userId: string;
    name: string;
    expiresIn: number;
}) => Promise<{ key: string }>;

function isTokenResponse(value: unknown): value is { access_token: string } {
    return (
        typeof value === "object" &&
        value !== null &&
        "access_token" in value &&
        typeof value.access_token === "string"
    );
}

export function deviceApiKeys(createApiKey: CreateApiKey) {
    return {
        id: "device-api-keys",
        hooks: {
            after: [
                {
                    matcher: (ctx) => ctx.path === "/device/token",
                    handler: createAuthMiddleware(async (ctx) => {
                        const returned = ctx.context.returned;
                        if (!isTokenResponse(returned)) return;
                        const token = returned.access_token;
                        const found =
                            await ctx.context.internalAdapter.findSession(
                                token,
                            );
                        if (!found) return;
                        await ctx.context.internalAdapter.deleteSession(token);
                        const { key } = await createApiKey({
                            userId: found.session.userId,
                            name: CLI_API_KEY_NAME,
                            expiresIn: CLI_API_KEY_EXPIRES_IN,
                        });
                        return ctx.json({
                            ...returned,
                            access_token: key,
                            expires_in: CLI_API_KEY_EXPIRES_IN,
                        });
                    }),
                },
            ],
        },
    } satisfies BetterAuthPlugin;
}
