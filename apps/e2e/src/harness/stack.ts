import { createDb } from "@quilt/db";
import { migrateDb } from "@quilt/db/migrate";

import {
    assertDisposableContext,
    createKubeClients,
    createNamespace,
    deleteRunNamespaces,
} from "../support/kubernetes";
import { startController } from "./controller";
import { createDatabase, dropDatabase } from "./database";
import { startServer } from "./server";

export type StackOptions = {
    runId: string;
    adminDatabaseUrl: string;
    kubeContext: string;
    reconcileIntervalMs: number;
    keepResources: boolean;
};

export type Stack = AsyncDisposable & {
    baseUrl: string;
    databaseUrl: string;
    namespace: string;
};

export async function startStack(options: StackOptions): Promise<Stack> {
    assertDisposableContext(options.kubeContext);
    const resources = new AsyncDisposableStack();
    const cleanup = (task: () => Promise<void>) => {
        if (!options.keepResources) resources.defer(task);
    };

    try {
        const kube = createKubeClients(options.kubeContext);

        const databaseName = `quilt_e2e_${options.runId}`;
        const databaseUrl = await createDatabase(
            options.adminDatabaseUrl,
            databaseName,
        );
        cleanup(() => dropDatabase(options.adminDatabaseUrl, databaseName));

        const db = createDb({ DATABASE_URL: databaseUrl });
        resources.defer(() => db.$client.end());
        await migrateDb(db);

        const namespace = `quilt-e2e-${options.runId}`;
        cleanup(() => deleteRunNamespaces(kube, options.runId));
        await createNamespace(kube, namespace, options.runId);

        const server = await startServer(db);
        resources.defer(() => server.close());

        const controller = startController({
            db,
            kubeContext: options.kubeContext,
            intervalMs: options.reconcileIntervalMs,
        });
        resources.defer(() => controller.stop());

        return {
            baseUrl: server.baseUrl,
            databaseUrl,
            namespace,
            [Symbol.asyncDispose]: () => resources.disposeAsync(),
        };
    } catch (error) {
        await resources.disposeAsync();
        throw error;
    }
}
