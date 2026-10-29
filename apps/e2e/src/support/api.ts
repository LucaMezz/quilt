import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@quilt/api/router";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiSession = {
    rpc: AppRouterClient;
    rest(method: HttpMethod, path: string, body?: unknown): Promise<Response>;
};

export function createApiSession(baseUrl: string, cookie?: string): ApiSession {
    const authHeaders: Record<string, string> = cookie ? { cookie } : {};

    return {
        rpc: createORPCClient(
            new RPCLink({ url: `${baseUrl}/rpc`, headers: authHeaders }),
        ),
        rest(method, path, body) {
            return fetch(`${baseUrl}/api-reference${path}`, {
                method,
                headers:
                    body === undefined
                        ? authHeaders
                        : {
                              ...authHeaders,
                              "content-type": "application/json",
                          },
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        },
    };
}
