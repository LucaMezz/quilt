import type { Cluster } from "@quilt/cluster";
import type { Database } from "@quilt/db";

export type ControllerOptions = {
    db: Database;
    cluster: Cluster;
    intervalMs: number;
    signal: AbortSignal;
    onError?: (error: unknown) => void;
};

export async function runController(_options: ControllerOptions) {}
