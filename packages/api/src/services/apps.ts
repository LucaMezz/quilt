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
    organizationId: string;
    name: string;
};

function inOrganization(ref: AppRef) {
    return and(
        eq(app.organizationId, ref.organizationId),
        eq(app.name, ref.name),
        isNull(app.deletedAt),
    );
}

export async function getOwnedApp(db: Database, ref: AppRef): Promise<App> {
    const [found] = await db.select().from(app).where(inOrganization(ref));
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
            organizationId: ref.organizationId,
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
        .where(inOrganization(ref))
        .returning();
    if (!destroyed) {
        throw new AppNotFoundError(ref.name);
    }
    return destroyed;
}

export async function listApps(
    db: Database,
    organizationId: string,
    page: PageParams,
): Promise<Page<App>> {
    const rows = await db
        .select()
        .from(app)
        .where(
            and(
                eq(app.organizationId, organizationId),
                isNull(app.deletedAt),
                afterCursor(app, page.cursor),
            ),
        )
        .orderBy(...keysetOrder(app))
        .limit(page.limit + 1);
    return toPage(rows, page.limit);
}
