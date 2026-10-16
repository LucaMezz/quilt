import type { RouterClient } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

export const appRouter = {
    healthCheck: publicProcedure
        .route({
            method: "GET",
            path: "/health",
            summary: "Health check",
            tags: ["System"],
        })
        .output(z.literal("OK").describe("Always `OK` while the server is up"))
        .handler(() => {
            return "OK" as const;
        }),
    privateData: protectedProcedure
        .route({
            method: "GET",
            path: "/private",
            summary: "Private data",
            tags: ["Example"],
        })
        .handler(({ context }) => {
            return {
                message: "This is private",
                user: context.session?.user,
            };
        }),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
