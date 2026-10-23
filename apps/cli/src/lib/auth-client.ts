import { apiKeyClient } from "@better-auth/api-key/client";
import { createAuthClient } from "better-auth/client";
import {
    deviceAuthorizationClient,
    organizationClient,
} from "better-auth/client/plugins";

import { env } from "../config";

export const authClient = createAuthClient({
    baseURL: env.QUILT_API_URL,
    plugins: [
        apiKeyClient(),
        deviceAuthorizationClient(),
        organizationClient(),
    ],
});
