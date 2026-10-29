import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { API_KEY_SCHEME } from "./openapi";

const o = os.$context<Context>();

export const publicProcedure = o;

const requireCaller = o.middleware(async ({ context, next }) => {
    if (!context.caller) {
        throw new ORPCError("UNAUTHORIZED");
    }
    return next({
        context: {
            caller: context.caller,
        },
    });
});

export const protectedProcedure = publicProcedure.use(requireCaller).route({
    spec: (operation) => ({
        ...operation,
        security: [{ [API_KEY_SCHEME]: [] }],
        responses: {
            ...operation.responses,
            401: {
                description: "Missing, invalid, disabled or expired API key",
            },
        },
    }),
});
