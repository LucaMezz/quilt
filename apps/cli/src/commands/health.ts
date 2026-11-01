import { Command } from "@commander-js/extra-typings";

import { client, serverUrl } from "../client";
import { log } from "../ui/log";
import { spinner } from "../ui/spinner";
import { symbols } from "../ui/theme";

export default new Command("health")
    .description("Check that the quilt API is reachable")
    .action(async () => {
        const host = new URL(serverUrl).host;
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
    });
