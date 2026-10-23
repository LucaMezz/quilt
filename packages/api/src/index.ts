import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { SESSION_COOKIE_SCHEME } from "./openapi";
import { MAX_IMAGE_BYTES } from "./services/images";

export const MAX_REQUEST_BODY_BYTES = MAX_IMAGE_BYTES + 1024 * 1024;

export const o = os.$context<Context>();

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

export const sessionProcedure = protectedProcedure.use(
    async ({ context, next }) => {
        if (context.caller.kind !== "session") {
            throw new ORPCError("FORBIDDEN", {
                message:
                    "This endpoint needs a signed-in session, not an API key",
            });
        }
        return next({ context: { session: context.caller.session } });
    },
);
