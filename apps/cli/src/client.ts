import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@quilt/api/routers/index";

export const serverUrl = (
    process.env.QUILT_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const link = new RPCLink({
    url: `${serverUrl}/rpc`,
});

export const client: AppRouterClient = createORPCClient(link);
