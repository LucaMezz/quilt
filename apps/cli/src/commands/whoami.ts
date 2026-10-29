import { defineCommand } from "citty";

import { serverHost } from "../client";
import { getKeySession } from "../lib/api-key-session";
import { getCredential } from "../lib/credentials";
import { log } from "../ui/log";
import { symbols, theme } from "../ui/theme";

const SOURCES = {
    keychain: "Key stored in your system keychain",
    file: "Key stored in a plain-text file",
    QUILT_TOKEN: "Key from QUILT_TOKEN",
};

export default defineCommand({
    meta: {
        name: "whoami",
        description: "Show who you're signed in as on your quilt server",
    },
    async run() {
        const credential = getCredential(serverHost);
        if (!credential) {
            log.error(`Not signed in to ${serverHost}`);
            log.hint(`Run ${theme.brand("quilt login")} to sign in.`);
            process.exitCode = 1;
            return;
        }

        const result = await getKeySession(credential.token).catch(
            () => undefined,
        );
        if (!result) {
            log.error(`Could not reach ${serverHost}`);
            process.exitCode = 1;
            return;
        }
        if (result.error && result.error.status !== 401) {
            log.error(
                `${serverHost} couldn't check your key`,
                result.error.message,
            );
            process.exitCode = 1;
            return;
        }
        if (!result.data) {
            log.error(`Your key for ${serverHost} is no longer valid`);
            log.hint(`Run ${theme.brand("quilt login")} to sign in again.`);
            process.exitCode = 1;
            return;
        }
        log.success(
            `Signed in as ${theme.heading(result.data.user.name)}`,
            `${result.data.user.email} ${symbols.dot} ${serverHost}`,
        );
        log.hint(SOURCES[credential.source]);
    },
});
