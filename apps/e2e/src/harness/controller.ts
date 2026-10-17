import { createKubernetesCluster } from "@quilt/cluster";
import type { Database } from "@quilt/db";
import { runController } from "controller/controller";

export function startController(options: {
    db: Database;
    kubeContext: string;
    intervalMs: number;
}) {
    const shutdown = new AbortController();
    const running = runController({
        db: options.db,
        cluster: createKubernetesCluster({ KUBE_CONTEXT: options.kubeContext }),
        intervalMs: options.intervalMs,
        signal: shutdown.signal,
        onError: (error) => console.error("[e2e controller]", error),
    });

    return {
        async stop() {
            shutdown.abort();
            await running;
        },
    };
}
