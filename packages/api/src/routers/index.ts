import type { RouterClient } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../procedures";
import { appsRouter } from "./orgs/apps";
import { organizationsRouter } from "./orgs/organizations";
import { apiKeysRouter } from "./user/api-keys";
import { userRouter } from "./user/users";

export const appRouter = {
    apiKeys: apiKeysRouter,
    apps: appsRouter,
    organizations: organizationsRouter,
    user: userRouter,
    healthCheck: publicProcedure
        .route({
            method: "GET",
            path: "/health",
            operationId: "healthCheck",
            summary: "Health check",
            description:
                "Reports whether the API server is up. Needs no authentication.",
            successDescription: "Server is up",
            tags: ["System"],
        })
        // z.enum rather than z.literal: Fumadocs can't name a `const` schema
        // and shows "unknown", but it renders a one-value enum as `"OK"`.
        .output(z.enum(["OK"]).describe("Always `OK` while the server is up"))
        .handler(() => {
            return "OK" as const;
        }),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
