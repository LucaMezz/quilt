import type { Session } from "@quilt/auth";
import type { Database } from "@quilt/db";

export type Context = {
    session: Session | null;
    db: Database;
};
