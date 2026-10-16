import type { Context as ApiContext } from "@quilt/api/context";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import { auth, db } from "./services";

interface CreateContextOptions {
    req: Request;
}

export async function createContext(
    opts: CreateContextOptions,
): Promise<ApiContext> {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(opts.req.headers),
    });
    return {
        db,
        session,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
