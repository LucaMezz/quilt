import { arch, hostname, platform } from "node:os";
import { apiKeyClient } from "@better-auth/api-key/client";
import { createAuthClient } from "better-auth/client";
import {
    deviceAuthorizationClient,
    organizationClient,
} from "better-auth/client/plugins";

import pkg from "../../package.json" with { type: "json" };
import { env } from "../config";

const userAgent = `quilt-cli/${pkg.version} (${hostname()}; ${platform()} ${arch()})`;

export const authClient = createAuthClient({
    baseURL: env.QUILT_API_URL,
    fetchOptions: {
        headers: { "user-agent": userAgent },
    },
    plugins: [
        apiKeyClient(),
        deviceAuthorizationClient(),
        organizationClient(),
    ],
});
