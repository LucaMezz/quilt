import type { OpenAPIGeneratorGenerateOptions } from "@orpc/openapi";

export const SESSION_COOKIE_SCHEME = "sessionCookie";

// Shared by the spec script and the server's live reference so both describe
// auth the same way. Better Auth adds the `__Secure-` prefix over HTTPS.
export const openAPISecuritySchemes = {
    [SESSION_COOKIE_SCHEME]: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
        description:
            "Session cookie set by signing in through Better Auth at `/api/auth/sign-in/email`. Named `__Secure-better-auth.session_token` over HTTPS.",
    },
} satisfies NonNullable<
    NonNullable<OpenAPIGeneratorGenerateOptions["components"]>["securitySchemes"]
>;
