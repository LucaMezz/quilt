import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { SESSION_COOKIE_SCHEME } from "./openapi";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
    if (!context.session?.user) {
        throw new ORPCError("UNAUTHORIZED");
    }
    return next({
        context: {
            session: context.session,
        },
    });
});

export const protectedProcedure = publicProcedure.use(requireAuth).route({
    // Marks every protected procedure as needing a session in the OpenAPI spec.
    spec: (operation) => ({
        ...operation,
        security: [{ [SESSION_COOKIE_SCHEME]: [] }],
        responses: {
            ...operation.responses,
            401: { description: "No valid session" },
        },
    }),
});
