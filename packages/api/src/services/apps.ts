import type { Database } from "@quilt/db";
import { type App, app } from "@quilt/db/schema/app";
import { and, eq, isNull } from "drizzle-orm";

import {
    afterCursor,
    keysetOrder,
    type Page,
    type PageParams,
    toPage,
} from "../pagination";

export class AppNotFoundError extends Error {
    constructor(name: string) {
        super(`App "${name}" not found`);
        this.name = "AppNotFoundError";
    }
}

export class AppNameTakenError extends Error {
    constructor(name: string) {
        super(`App name "${name}" is already taken`);
        this.name = "AppNameTakenError";
    }
}

export type AppRef = {
    ownerId: string;
    name: string;
};

function ownedBy(ref: AppRef) {
    return and(
        eq(app.ownerId, ref.ownerId),
        eq(app.name, ref.name),
        isNull(app.deletedAt),
    );
}

export async function getOwnedApp(db: Database, ref: AppRef): Promise<App> {
    const [found] = await db.select().from(app).where(ownedBy(ref));
    if (!found) {
        throw new AppNotFoundError(ref.name);
    }
    return found;
}

export async function createApp(
    db: Database,
    ref: AppRef,
    appsDomain: string,
): Promise<App> {
    const id = crypto.randomUUID();
    const [created] = await db
        .insert(app)
        .values({
            id,
            ownerId: ref.ownerId,
            name: ref.name,
            namespace: `app-${id}`,
            hostname: `${ref.name}.${appsDomain}`,
        })
        .returning();
    return created!;
}

export async function destroyApp(db: Database, ref: AppRef): Promise<App> {
    const [destroyed] = await db
        .update(app)
        .set({ status: "destroying" })
        .where(ownedBy(ref))
        .returning();
    if (!destroyed) {
        throw new AppNotFoundError(ref.name);
    }
    return destroyed;
}

export async function listApps(
    db: Database,
    ownerId: string,
    page: PageParams,
): Promise<Page<App>> {
    const rows = await db
        .select()
        .from(app)
        .where(
            and(
                eq(app.ownerId, ownerId),
                isNull(app.deletedAt),
                afterCursor(app, page.cursor),
            ),
        )
        .orderBy(...keysetOrder(app))
        .limit(page.limit + 1);
    return toPage(rows, page.limit);
}
