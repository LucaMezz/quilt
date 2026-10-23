import { type OpenAPIGeneratorGenerateOptions, oo } from "@orpc/openapi";

import { API_KEY_HEADER, API_KEY_PREFIX } from "@quilt/auth/api-keys";

import type { ProcedureMeta } from "./context";

export const API_KEY_SCHEME = "apiKey";

// Shared by the spec script and the server's live reference so both document
// the same public API: what an API key can call, without session-only endpoints.
export const openAPIGenerateOptions = {
    components: {
        securitySchemes: {
            [API_KEY_SCHEME]: {
                type: "apiKey",
                in: "header",
                name: API_KEY_HEADER,
                description: `Send an API key in the \`${API_KEY_HEADER}\` header, e.g. \`${API_KEY_HEADER}: ${API_KEY_PREFIX}...\`. Keys act as the user who created them and are created while signed in to quilt; the full key is shown only once.`,
            },
        },
    },
    filter: ({ contract }) =>
        !(contract["~orpc"].meta as ProcedureMeta).sessionOnly,
} satisfies OpenAPIGeneratorGenerateOptions;

export function describeErrorResponse<T extends object>(
    error: T,
    status: number,
    description: string,
): T {
    return oo.spec(error, (operation) => ({
        ...operation,
        responses: {
            ...operation.responses,
            [status]: { ...operation.responses?.[status], description },
        },
    }));
}
