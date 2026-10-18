import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { SESSION_COOKIE_SCHEME } from "./openapi";
import { MAX_IMAGE_BYTES } from "./services/images";

export const MAX_REQUEST_BODY_BYTES = MAX_IMAGE_BYTES + 1024 * 1024;

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
