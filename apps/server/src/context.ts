import type { Context as ApiContext } from "@quilt/api/context";
import type { Auth } from "@quilt/auth";
import type { Database } from "@quilt/db";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

export function createContextFactory(auth: Auth, db: Database) {
    return async (req: Request): Promise<ApiContext> => {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        return { db, session };
    };
}
