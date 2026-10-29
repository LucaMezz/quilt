import type { Database } from "@quilt/db";
import { type App, app } from "@quilt/db/schema/app";
import type { Storage } from "@quilt/storage";
import { and, eq, isNull } from "drizzle-orm";
import { replaceImage } from "../lib/images";
import {
    afterCursor,
    keysetOrder,
    type Page,
    type PageParams,
    toPage,
} from "../lib/pagination";

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
        .onConflictDoNothing({ target: app.name })
        .returning();
    if (!created) {
        throw new AppNameTakenError(ref.name);
    }
    return created;
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

export const APP_LOGO_DIMENSION = 512;

export function appLogoPrefix(appId: string) {
    return `apps/${appId}/logo/`;
}

export async function setAppLogo(
    db: Database,
    storage: Storage,
    target: App,
    logo: Blob,
): Promise<App> {
    const slot = {
        prefix: appLogoPrefix(target.id),
        maxDimension: APP_LOGO_DIMENSION,
        currentKey: target.logo,
    };
    return replaceImage(storage, slot, logo, async (key) => {
        const [updated] = await db
            .update(app)
            .set({ logo: key })
            .where(and(eq(app.id, target.id), isNull(app.deletedAt)))
            .returning();
        if (!updated) {
            throw new AppNotFoundError(target.name);
        }
        return updated;
    });
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
