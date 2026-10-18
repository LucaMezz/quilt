import { createDb } from "@quilt/db";
import { migrateDb } from "@quilt/db/migrate";
import { createDatabase, dropDatabase } from "@quilt/db/testing";
import { createStorage } from "@quilt/storage";
import { createBucket, dropBucket } from "@quilt/storage/testing";
import {
    assertDisposableContext,
    createKubeClients,
    createNamespace,
    deleteRunNamespaces,
} from "../support/kubernetes";
import { startController } from "./controller";
import { startServer } from "./server";

export type StackOptions = {
    runId: string;
    adminDatabaseUrl: string;
    storage: {
        endpoint: string;
        accessKeyId: string;
        secretAccessKey: string;
    };
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

        const storage = createStorage({
            STORAGE_ENDPOINT: options.storage.endpoint,
            STORAGE_REGION: "us-east-1",
            STORAGE_BUCKET: `quilt-e2e-${options.runId}`,
            STORAGE_FORCE_PATH_STYLE: true,
            STORAGE_ACCESS_KEY_ID: options.storage.accessKeyId,
            STORAGE_SECRET_ACCESS_KEY: options.storage.secretAccessKey,
        });
        resources.defer(async () => storage.client.destroy());
        await createBucket(storage);
        cleanup(() => dropBucket(storage));

        const namespace = `quilt-e2e-${options.runId}`;
        cleanup(() => deleteRunNamespaces(kube, options.runId));
        await createNamespace(kube, namespace, options.runId);

        const server = await startServer(db, storage);
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
