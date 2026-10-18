import type { RouterClient } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";
import { appsRouter } from "./apps";

export const appRouter = {
    ...appsRouter,
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
    privateData: protectedProcedure
        .route({
            method: "GET",
            path: "/private",
            summary: "Private data",
            tags: ["Example"],
        })
        .output(
            z.object({
                message: z.string(),
                user: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.email(),
                    emailVerified: z.boolean(),
                    image: z.string().nullish(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                }),
            }),
        )
        .handler(({ context }) => {
            return {
                message: "This is private",
                user: context.session.user,
            };
        }),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
