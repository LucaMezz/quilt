import type { Auth, Session } from "@quilt/auth";
import type { Database } from "@quilt/db";
import type { Storage } from "@quilt/storage";

export type Context = {
    auth: Auth;
    headers: Headers;
    session: Session | null;
    db: Database;
    storage: Storage;
    appsDomain: string;
};
