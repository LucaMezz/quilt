import { apiKey } from "@better-auth/api-key";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@quilt/db";
import * as schema from "@quilt/db/schema/auth";
import { betterAuth } from "better-auth";
import { deviceAuthorization, organization } from "better-auth/plugins";

import {
    API_KEY_EXPIRES_IN_DAYS,
    API_KEY_HEADER,
    API_KEY_NAME_LENGTH,
    API_KEY_PREFIX,
} from "./api-keys";

export type AuthConfig = {
    BETTER_AUTH_URL: string;
    BETTER_AUTH_SECRET: string;
    CORS_ORIGIN: string;
};

export function createAuth(
    env: AuthConfig,
    database: Database,
    desktopOrigins: readonly string[] = [],
) {
    return betterAuth({
        database: drizzleAdapter(database, {
            provider: "pg",
            schema,
        }),
        trustedOrigins: [env.CORS_ORIGIN, ...desktopOrigins],
        emailAndPassword: { enabled: true },
        secret: env.BETTER_AUTH_SECRET,
        baseURL: env.BETTER_AUTH_URL,
        advanced: {
            defaultCookieAttributes: {
                sameSite: "none",
                secure: true,
                httpOnly: true,
            },
        },
        plugins: [
            organization(),
            apiKey({
                requireName: true,
                minimumNameLength: API_KEY_NAME_LENGTH.min,
                maximumNameLength: API_KEY_NAME_LENGTH.max,
                keyExpiration: {
                    minExpiresIn: API_KEY_EXPIRES_IN_DAYS.min,
                    maxExpiresIn: API_KEY_EXPIRES_IN_DAYS.max,
                },
                defaultPrefix: API_KEY_PREFIX,
                apiKeyHeaders: API_KEY_HEADER,
                rateLimit: { enabled: false },
                enableSessionForAPIKeys: true,
            }),
            deviceAuthorization({
                verificationUri: `${env.CORS_ORIGIN}/device`,
            }),
        ],
    });
}

export { isAPIError } from "better-auth/api";
export type { StandardSchemaV1 } from "better-call";

export interface Auth extends ReturnType<typeof createAuth> {}
export type Session = Auth["$Infer"]["Session"];
