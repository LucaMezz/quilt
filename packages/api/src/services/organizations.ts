import { type Auth, isAPIError } from "@quilt/auth";
import type { Database } from "@quilt/db";
import { app } from "@quilt/db/schema/app";
import { member, organization } from "@quilt/db/schema/auth";
import type { Storage } from "@quilt/storage";
import { and, eq, getColumns, isNotNull, isNull } from "drizzle-orm";

import { replaceImage } from "../lib/images";

export type Organization = typeof organization.$inferSelect;

export class OrganizationNotFoundError extends Error {
    constructor(slug: string) {
        super(`Organization "${slug}" not found`);
        this.name = "OrganizationNotFoundError";
    }
}

export class OrganizationSlugTakenError extends Error {
    constructor(slug: string) {
        super(`Organization slug "${slug}" is already taken`);
        this.name = "OrganizationSlugTakenError";
    }
}

export class OrganizationForbiddenError extends Error {
    constructor(reason: string) {
        super(reason);
        this.name = "OrganizationForbiddenError";
    }
}

export class OrganizationHasAppsError extends Error {
    constructor(slug: string) {
        super(`Organization "${slug}" still has apps`);
        this.name = "OrganizationHasAppsError";
    }
}

export type NewOrganization = {
    name: string;
    slug: string;
};

export type OrganizationChanges = {
    name?: string;
    slug?: string;
};

export async function getMemberOrganization(
    db: Database,
    userId: string,
    slug: string,
): Promise<Organization> {
    const [found] = await db
        .select(getColumns(organization))
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(and(eq(organization.slug, slug), eq(member.userId, userId)))
        .limit(1);
    if (!found) {
        throw new OrganizationNotFoundError(slug);
    }
    return found;
}

export async function listOrganizations(auth: Auth, headers: Headers) {
    return auth.api.listOrganizations({ headers });
}

export async function createOrganization(
    auth: Auth,
    headers: Headers,
    input: NewOrganization,
) {
    try {
        const created = await auth.api.createOrganization({
            body: {
                name: input.name,
                slug: input.slug,
                keepCurrentActiveOrganization: true,
            },
            headers,
        });
        if (!created) throw new Error("Better Auth returned no organization");
        return created;
    } catch (error) {
        if (isAPIError(error)) {
            if (error.body?.code === "ORGANIZATION_ALREADY_EXISTS") {
                throw new OrganizationSlugTakenError(input.slug);
            }
            if (error.status === "FORBIDDEN") {
                throw new OrganizationForbiddenError(error.message);
            }
        }
        throw error;
    }
}

export async function updateOrganization(
    auth: Auth,
    headers: Headers,
    target: Organization,
    changes: OrganizationChanges,
) {
    try {
        const updated = await auth.api.updateOrganization({
            body: { organizationId: target.id, data: changes },
            headers,
        });
        if (!updated) throw new Error("Better Auth returned no organization");
        return updated;
    } catch (error) {
        if (isAPIError(error)) {
            if (error.body?.code === "ORGANIZATION_SLUG_ALREADY_TAKEN") {
                throw new OrganizationSlugTakenError(
                    changes.slug ?? target.slug,
                );
            }
            if (error.status === "FORBIDDEN") {
                throw new OrganizationForbiddenError(error.message);
            }
        }
        throw error;
    }
}

export const ORGANIZATION_LOGO_DIMENSION = 512;

export function organizationLogoPrefix(organizationId: string) {
    return `organizations/${organizationId}/logo/`;
}

export async function setOrganizationLogo(
    auth: Auth,
    storage: Storage,
    headers: Headers,
    target: Organization,
    logo: Blob,
) {
    const { success } = await auth.api.hasPermission({
        body: {
            organizationId: target.id,
            permissions: { organization: ["update"] },
        },
        headers,
    });
    if (!success) {
        throw new OrganizationForbiddenError(
            "You are not allowed to update this organization",
        );
    }

    const slot = {
        prefix: organizationLogoPrefix(target.id),
        maxDimension: ORGANIZATION_LOGO_DIMENSION,
        currentKey: target.logo,
    };
    return replaceImage(storage, slot, logo, async (key) => {
        try {
            const updated = await auth.api.updateOrganization({
                body: { organizationId: target.id, data: { logo: key } },
                headers,
            });
            if (!updated) {
                throw new Error("Better Auth returned no organization");
            }
            return updated;
        } catch (error) {
            if (isAPIError(error) && error.status === "FORBIDDEN") {
                throw new OrganizationForbiddenError(error.message);
            }
            throw error;
        }
    });
}

export async function deleteOrganization(
    db: Database,
    auth: Auth,
    headers: Headers,
    target: Organization,
) {
    const { success } = await auth.api.hasPermission({
        body: {
            organizationId: target.id,
            permissions: { organization: ["delete"] },
        },
        headers,
    });
    if (!success) {
        throw new OrganizationForbiddenError(
            "You are not allowed to delete this organization",
        );
    }

    const [liveApp] = await db
        .select({ id: app.id })
        .from(app)
        .where(and(eq(app.organizationId, target.id), isNull(app.deletedAt)))
        .limit(1);
    if (liveApp) {
        throw new OrganizationHasAppsError(target.slug);
    }

    await db
        .delete(app)
        .where(
            and(eq(app.organizationId, target.id), isNotNull(app.deletedAt)),
        );

    try {
        return await auth.api.deleteOrganization({
            body: { organizationId: target.id },
            headers,
        });
    } catch (error) {
        if (isReferenceViolation(error)) {
            throw new OrganizationHasAppsError(target.slug);
        }
        throw error;
    }
}

const REFERENCE_VIOLATION_CODES = new Set(["23001", "23503"]);

function isReferenceViolation(error: unknown): boolean {
    let current: unknown = error;
    while (current instanceof Error) {
        const code = (current as { code?: unknown }).code;
        if (typeof code === "string" && REFERENCE_VIOLATION_CODES.has(code)) {
            return true;
        }
        current = current.cause;
    }
    return false;
}
