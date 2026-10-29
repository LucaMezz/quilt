import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@quilt/api/router";
import { API_KEY_HEADER } from "@quilt/auth/api-keys";

import { getToken } from "./lib/credentials";

export const serverUrl = (
    process.env.QUILT_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const serverHost = new URL(serverUrl).host;

const link = new RPCLink({
    url: `${serverUrl}/rpc`,
    headers: () => {
        const token = getToken(serverHost);
        return token ? { [API_KEY_HEADER]: token } : {};
    },
});

export const client: AppRouterClient = createORPCClient(link);
