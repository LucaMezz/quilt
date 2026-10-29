import {
    API_KEY_EXPIRES_IN_DAYS,
    API_KEY_NAME_LENGTH,
} from "@quilt/auth/api-keys";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { describeErrorResponse } from "../openapi";
import { PageInput, pageOf } from "../pagination";
import {
    ApiKeyNotFoundError,
    createApiKey,
    deleteApiKey,
    getApiKey,
    listApiKeys,
    updateApiKey,
} from "../services/api-keys";

export const ApiKeySchema = z.object({
    id: z.string(),
    name: z.string().nullish(),
    start: z.string().nullish(),
    prefix: z.string().nullish(),
    enabled: z.boolean(),
    expiresAt: z.date().nullish(),
    lastRequest: z.date().nullish(),
    createdAt: z.date(),
});

export const CreatedApiKeySchema = ApiKeySchema.extend({
    key: z
        .string()
        .describe(
            "The full API key. Shown only in this response; store it somewhere safe.",
        ),
});

export const ApiKeyRef = z.object({
    id: z.string().describe("ID of one of your API keys"),
});

const SECONDS_PER_DAY = 60 * 60 * 24;

const ApiKeyName = z
    .string()
    .trim()
    .min(API_KEY_NAME_LENGTH.min)
    .max(API_KEY_NAME_LENGTH.max);

const ApiKeyExpiresIn = z
    .int()
    .min(API_KEY_EXPIRES_IN_DAYS.min * SECONDS_PER_DAY)
    .max(API_KEY_EXPIRES_IN_DAYS.max * SECONDS_PER_DAY)
    .describe("Seconds until the key expires");

const apiKeyNotFound = describeErrorResponse(
    { message: "API key not found" },
    404,
    "No API key with this ID exists that belongs to you",
);

export const apiKeysRouter = {
    listApiKeys: protectedProcedure
        .route({
            method: "GET",
            path: "/user/api-keys",
            summary: "List API keys",
            description:
                "Lists your API keys, newest first. Results are paginated: pass `nextCursor` back as `cursor` to get the next page.",
            successDescription: "A page of your API keys",
            tags: ["API Keys"],
        })
        .input(PageInput)
        .output(pageOf(ApiKeySchema))
        .handler(({ input, context }) =>
            listApiKeys(context.auth, context.headers, input),
        ),
    createApiKey: protectedProcedure
        .route({
            method: "POST",
            path: "/user/api-keys",
            successStatus: 201,
            summary: "Create API key",
            description: "Creates an API key for this user",
            successDescription: "New API key",
            tags: ["API Keys"],
        })
        .input(
            z.object({
                name: ApiKeyName,
                expiresIn: ApiKeyExpiresIn,
            }),
        )
        .output(CreatedApiKeySchema)
        .handler(({ input, context }) =>
            createApiKey(context.auth, context.headers, {
                name: input.name,
                expiresIn: input.expiresIn,
            }),
        ),
    getApiKey: protectedProcedure
        .route({
            method: "GET",
            path: "/user/api-keys/{id}",
            summary: "Get API key",
            description: "Gets the API key",
            successDescription: "API Key",
            tags: ["API Keys"],
        })
        .errors({ NOT_FOUND: apiKeyNotFound })
        .input(ApiKeyRef)
        .output(ApiKeySchema)
        .handler(async ({ input, context, errors }) => {
            try {
                return await getApiKey(context.auth, context.headers, input.id);
            } catch (error) {
                if (error instanceof ApiKeyNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                throw error;
            }
        }),
    updateApiKey: protectedProcedure
        .route({
            method: "PATCH",
            path: "/user/api-keys/{id}",
            summary: "Update API key",
            description:
                "Renames the API key or enables or disables it. A disabled key is rejected until it is enabled again.",
            successDescription: "API key updated",
            tags: ["API Keys"],
        })
        .errors({ NOT_FOUND: apiKeyNotFound })
        .input(
            ApiKeyRef.extend({
                name: ApiKeyName.optional(),
                enabled: z.boolean().optional(),
            }).refine(
                (input) =>
                    input.name !== undefined || input.enabled !== undefined,
                { message: "Provide a new name or enabled state" },
            ),
        )
        .output(ApiKeySchema)
        .handler(async ({ input, context, errors }) => {
            try {
                return await updateApiKey(
                    context.auth,
                    context.headers,
                    input.id,
                    { name: input.name, enabled: input.enabled },
                );
            } catch (error) {
                if (error instanceof ApiKeyNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                throw error;
            }
        }),
    deleteApiKey: protectedProcedure
        .route({
            method: "DELETE",
            path: "/user/api-keys/{id}",
            summary: "Delete API key",
            description:
                "Deletes the API key. Requests made with it are rejected from then on.",
            successDescription: "API key deleted",
            tags: ["API Keys"],
        })
        .errors({ NOT_FOUND: apiKeyNotFound })
        .input(ApiKeyRef)
        .output(ApiKeySchema)
        .handler(async ({ input, context, errors }) => {
            try {
                return await deleteApiKey(
                    context.auth,
                    context.headers,
                    input.id,
                );
            } catch (error) {
                if (error instanceof ApiKeyNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                throw error;
            }
        }),
};
