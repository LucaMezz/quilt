import { defineCommand } from "citty";

import { client } from "../client";
import { env } from "../config";
import { log } from "../ui/log";
import { spinner } from "../ui/spinner";
import { symbols } from "../ui/theme";

export default defineCommand({
    meta: {
        name: "health",
        description: "Check that the quilt API is reachable",
    },
    async run() {
        const host = new URL(env.QUILT_API_URL).host;
        const progress = spinner(`Checking ${host}…`);
        const started = performance.now();

        try {
            await client.healthCheck();
            const ms = Math.round(performance.now() - started);
            progress.stop();
            log.success("API is reachable", `${host} ${symbols.dot} ${ms}ms`);
        } catch (error) {
            progress.stop();
            log.error(
                `Could not reach the API at ${host}`,
                error instanceof Error ? error.message : String(error),
            );
            log.hint("Set QUILT_API_URL to point at your quilt server.");
            process.exitCode = 1;
        }
    },
});
