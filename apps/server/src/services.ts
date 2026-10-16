import { createAuth } from "@quilt/auth";
import { createDb } from "@quilt/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
