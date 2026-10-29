import { defineCommand } from "citty";

import { serverHost } from "../client";
import { revokeApiKey } from "../lib/api-key-session";
import { deleteToken, getToken } from "../lib/credentials";
import { log } from "../ui/log";

export default defineCommand({
    meta: {
        name: "logout",
        description: "Sign this device out of your quilt server",
    },
    async run() {
        if (process.env.QUILT_TOKEN) {
            log.error(
                "QUILT_TOKEN is set, so there's no saved sign-in to remove",
            );
            log.hint("Unset QUILT_TOKEN to use the key saved by quilt login.");
            process.exitCode = 1;
            return;
        }
        const token = getToken(serverHost);
        if (!token) {
            log.info(`Not signed in to ${serverHost}`);
            return;
        }
        const revoked = await revokeApiKey(token).then(
            () => true,
            () => false,
        );
        deleteToken(serverHost);
        if (!revoked) {
            log.warn(
                `Signed out on this device, but couldn't revoke its key on ${serverHost}`,
            );
            log.hint(
                'Delete the "quilt CLI" key under API keys in the dashboard.',
            );
            process.exitCode = 1;
            return;
        }
        log.success(`Signed out of ${serverHost}`);
    },
});
