import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@quilt/api/routers/index";

import { env } from "./config";

const link = new RPCLink({
    url: `${env.QUILT_API_URL}/rpc`,
});

export const client: AppRouterClient = createORPCClient(link);
