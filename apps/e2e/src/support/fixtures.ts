import { createDb } from "@quilt/db";
import { test as baseTest, inject } from "vitest";

import "../harness/environment";
import { createApiSession } from "./api";
import { signUp } from "./auth";
import { createKubeClients, createNamespace } from "./kubernetes";
import { uniqueName } from "./names";

export const test = baseTest
    .extend("e2e", { scope: "worker" }, () => inject("e2e"))
    .extend("db", { scope: "worker" }, ({ e2e }, { onCleanup }) => {
        const db = createDb({ DATABASE_URL: e2e.databaseUrl });
        onCleanup(() => db.$client.end());
        return db;
    })
    .extend("kube", { scope: "worker" }, ({ e2e }) =>
        createKubeClients(e2e.kubeContext),
    )
    .extend("anonymous", ({ e2e }) => createApiSession(e2e.baseUrl))
    .extend(
        "signUp",
        ({ e2e }) =>
            (prefix = "user") =>
                signUp(e2e.baseUrl, uniqueName(prefix)),
    )
    .extend("user", ({ signUp }) => signUp())
    .extend(
        "createNamespace",
        ({ e2e, kube }) =>
            (name: string) =>
                createNamespace(kube, name, e2e.runId),
    );
