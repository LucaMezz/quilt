import { type Auth, isAPIError } from "@quilt/auth";

import { type Page, type PageParams, paginateInMemory } from "../pagination";

export type ApiKey = Awaited<ReturnType<Auth["api"]["getApiKey"]>>;

export type CreatedApiKey = Awaited<ReturnType<Auth["api"]["createApiKey"]>>;

export class ApiKeyNotFoundError extends Error {
    constructor(id: string) {
        super(`API key "${id}" not found`);
        this.name = "ApiKeyNotFoundError";
    }
}

function isKeyNotFound(error: unknown) {
    return isAPIError(error) && error.body?.code === "KEY_NOT_FOUND";
}

export type NewApiKey = {
    name: string;
    expiresIn: number;
};

export type ApiKeyChanges = {
    name?: string;
    enabled?: boolean;
};

export async function listApiKeys(
    auth: Auth,
    headers: Headers,
    page: PageParams,
): Promise<Page<ApiKey>> {
    const { apiKeys } = await auth.api.listApiKeys({ headers });
    return paginateInMemory(apiKeys, page);
}

export async function createApiKey(
    auth: Auth,
    headers: Headers,
    input: NewApiKey,
): Promise<CreatedApiKey> {
    return auth.api.createApiKey({ body: input, headers });
}

export async function getApiKey(
    auth: Auth,
    headers: Headers,
    id: string,
): Promise<ApiKey> {
    try {
        return await auth.api.getApiKey({ query: { id }, headers });
    } catch (error) {
        if (isKeyNotFound(error)) {
            throw new ApiKeyNotFoundError(id);
        }
        throw error;
    }
}

export async function updateApiKey(
    auth: Auth,
    headers: Headers,
    id: string,
    changes: ApiKeyChanges,
): Promise<ApiKey> {
    try {
        return await auth.api.updateApiKey({
            body: { keyId: id, ...changes },
            headers,
        });
    } catch (error) {
        if (isKeyNotFound(error)) {
            throw new ApiKeyNotFoundError(id);
        }
        throw error;
    }
}

export async function deleteApiKey(
    auth: Auth,
    headers: Headers,
    id: string,
): Promise<ApiKey> {
    const target = await getApiKey(auth, headers, id);
    try {
        await auth.api.deleteApiKey({ body: { keyId: id }, headers });
    } catch (error) {
        if (isKeyNotFound(error)) {
            throw new ApiKeyNotFoundError(id);
        }
        throw error;
    }
    return target;
}
