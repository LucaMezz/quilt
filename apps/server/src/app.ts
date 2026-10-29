import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { BodyLimitPlugin, RPCHandler } from "@orpc/server/node";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { MAX_REQUEST_BODY_BYTES } from "@quilt/api";
import { openAPIGenerateOptions } from "@quilt/api/openapi";
import { appRouter } from "@quilt/api/router";
import type { Auth } from "@quilt/auth";
import type { Database } from "@quilt/db";
import type { Storage } from "@quilt/storage";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

import { createContextFactory } from "./context";

export type AppOptions = {
    auth: Auth;
    db: Database;
    storage: Storage;
    corsOrigin: string;
    appsDomain: string;
    onError?: (error: unknown) => void;
};

export function createApp({
    auth,
    db,
    storage,
    corsOrigin,
    appsDomain,
    onError: reportError = console.error,
}: AppOptions) {
    const app = express();
    const createContext = createContextFactory(auth, db, storage, appsDomain);

    app.use(
        cors({
            origin: corsOrigin,
            methods: ["GET", "POST", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }),
    );

    app.all("/api/auth{/*path}", toNodeHandler(auth));

    const rpcHandler = new RPCHandler(appRouter, {
        plugins: [new BodyLimitPlugin({ maxBodySize: MAX_REQUEST_BODY_BYTES })],
        interceptors: [onError(reportError)],
    });
    const apiHandler = new OpenAPIHandler(appRouter, {
        plugins: [
            new BodyLimitPlugin({ maxBodySize: MAX_REQUEST_BODY_BYTES }),
            new OpenAPIReferencePlugin({
                schemaConverters: [new ZodToJsonSchemaConverter()],
                specGenerateOptions: openAPIGenerateOptions,
            }),
        ],
        interceptors: [onError(reportError)],
    });

    app.use(async (req, res, next) => {
        const context = await createContext(req);

        const rpcResult = await rpcHandler.handle(req, res, {
            prefix: "/rpc",
            context,
        });
        if (rpcResult.matched) return;

        const apiResult = await apiHandler.handle(req, res, {
            prefix: "/api-reference",
            context,
        });
        if (apiResult.matched) return;

        next();
    });

    app.use(express.json());

    app.get("/", (_req, res) => {
        res.status(200).send("OK");
    });

    return app;
}
