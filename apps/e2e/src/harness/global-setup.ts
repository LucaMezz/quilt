import { randomBytes } from "node:crypto";

import type { TestProject } from "vitest/node";

import { ENV } from "../env.server";
import "./environment";
import { startStack } from "./stack";

export default async function setup(project: TestProject) {
    const runId = randomBytes(4).toString("hex");
    const stack = await startStack({
        runId,
        adminDatabaseUrl: ENV.E2E_DATABASE_URL,
        storage: {
            endpoint: ENV.E2E_STORAGE_ENDPOINT,
            accessKeyId: ENV.E2E_STORAGE_ACCESS_KEY_ID,
            secretAccessKey: ENV.E2E_STORAGE_SECRET_ACCESS_KEY,
        },
        kubeContext: ENV.E2E_KUBE_CONTEXT,
        reconcileIntervalMs: ENV.E2E_RECONCILE_INTERVAL_MS,
        keepResources: ENV.E2E_KEEP_RESOURCES,
    });

    project.provide("e2e", {
        runId,
        baseUrl: stack.baseUrl,
        databaseUrl: stack.databaseUrl,
        kubeContext: ENV.E2E_KUBE_CONTEXT,
        namespace: stack.namespace,
        image: ENV.E2E_IMAGE,
        reconcileIntervalMs: ENV.E2E_RECONCILE_INTERVAL_MS,
    });

    if (ENV.E2E_KEEP_RESOURCES) {
        console.log(
            `[e2e] keeping namespace ${stack.namespace}, database quilt_e2e_${runId} and bucket quilt-e2e-${runId}`,
        );
    }

    return () => stack[Symbol.asyncDispose]();
}
