import { defineCommand } from "citty";

import { client, serverUrl } from "../client";

export default defineCommand({
    meta: {
        name: "health",
        description: "Check that the quilt API is reachable",
    },
    async run() {
        try {
            const status = await client.healthCheck();
            console.log(`${serverUrl}: ${status}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : error;
            console.error(`${serverUrl}: unreachable (${message})`);
            process.exitCode = 1;
        }
    },
});
