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
            `[e2e] keeping namespace ${stack.namespace} and database quilt_e2e_${runId}`,
        );
    }

    return () => stack[Symbol.asyncDispose]();
}
