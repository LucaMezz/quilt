import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { ORPCError } from "@orpc/server";
import { createAuth } from "@quilt/auth";
import type { Database } from "@quilt/db";
import { createStorage } from "@quilt/storage";
import { createApp } from "server/app";

function reportUnexpectedError(error: unknown) {
    if (error instanceof ORPCError && error.status < 500) return;
    console.error("[e2e server]", error);
}

export async function startServer(db: Database) {
    const server = createServer();
    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;

    const auth = createAuth(
        {
            BETTER_AUTH_URL: baseUrl,
            BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
            CORS_ORIGIN: baseUrl,
        },
        db,
    );
    const storage = createStorage({
        STORAGE_ENDPOINT: "http://127.0.0.1:9000",
        STORAGE_REGION: "us-east-1",
        STORAGE_BUCKET: "quilt",
        STORAGE_FORCE_PATH_STYLE: true,
        STORAGE_ACCESS_KEY_ID: "quilt",
        STORAGE_SECRET_ACCESS_KEY: "password",
    });
    server.on(
        "request",
        createApp({
            auth,
            db,
            storage,
            corsOrigin: baseUrl,
            appsDomain: "127.0.0.1.sslip.io",
            onError: reportUnexpectedError,
        }),
    );

    return {
        baseUrl,
        async close() {
            server.closeAllConnections();
            await new Promise<void>((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve())),
            );
        },
    };
}
