import { resolveCaller } from "@quilt/api/caller";
import type { Context as ApiContext } from "@quilt/api/context";
import type { Auth } from "@quilt/auth";
import type { Database } from "@quilt/db";
import type { Storage } from "@quilt/storage";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

export function createContextFactory(
    auth: Auth,
    db: Database,
    storage: Storage,
    appsDomain: string,
) {
    return async (req: Request): Promise<ApiContext> => {
        const headers = fromNodeHeaders(req.headers);
        const caller = await resolveCaller(auth, headers);
        return { db, storage, appsDomain, auth, headers, caller };
    };
}
