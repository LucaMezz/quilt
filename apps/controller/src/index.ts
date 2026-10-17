import { createKubernetesCluster } from "@quilt/cluster";
import { createDb } from "@quilt/db";

import { runController } from "./controller";
import { ENV } from "./env.server";

const db = createDb(ENV);
const cluster = createKubernetesCluster(ENV);

const shutdown = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => shutdown.abort());
}

console.log(`Controller reconciling every ${ENV.RECONCILE_INTERVAL_MS}ms`);

await runController({
    db,
    cluster,
    intervalMs: ENV.RECONCILE_INTERVAL_MS,
    signal: shutdown.signal,
});

await db.$client.end();
