import type { RouterClient } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../procedures";
import { apiKeysRouter } from "./api-keys";
import { appsRouter } from "./apps";
import { organizationsRouter } from "./organizations";
import { usersRouter } from "./users";

export const appRouter = {
    ...apiKeysRouter,
    ...appsRouter,
    ...organizationsRouter,
    ...usersRouter,
    healthCheck: publicProcedure
        .route({
            method: "GET",
            path: "/health",
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
