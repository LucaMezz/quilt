import type { Auth, Session } from "@quilt/auth";
import type { Database } from "@quilt/db";
import type { Storage } from "@quilt/storage";

export type Caller =
    | { kind: "session"; userId: string; session: Session }
    | { kind: "apiKey"; userId: string; apiKeyId: string };

export type Context = {
    auth: Auth;
    headers: Headers;
    caller: Caller | null;
    db: Database;
    storage: Storage;
    appsDomain: string;
};
