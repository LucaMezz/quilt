import type { Auth, Session } from "@quilt/auth";
import type { Database } from "@quilt/db";

export type Context = {
    auth: Auth;
    headers: Headers;
    session: Session | null;
    db: Database;
    appsDomain: string;
};
