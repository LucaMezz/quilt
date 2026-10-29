import { z } from "zod";
import { InvalidImageError } from "../lib/images";
import { describeErrorResponse } from "../openapi";
import { protectedProcedure } from "../procedures";
import {
    createOrganization,
    deleteOrganization,
    getMemberOrganization,
    listOrganizations,
    ORGANIZATION_LOGO_DIMENSION,
    OrganizationForbiddenError,
    OrganizationHasAppsError,
    OrganizationNotFoundError,
    OrganizationSlugTakenError,
    setOrganizationLogo,
    updateOrganization,
} from "../services/organizations";
import { describeImageUpload, ImageFile, invalidImage } from "./shared/images";

const OrganizationSlug = z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
    .describe(
        "Identifies the organization in API paths and CLI flags. Unique across all organizations.",
    );

export const OrganizationRef = z.object({
    org: OrganizationSlug.describe(
        "Slug of an organization you're a member of",
    ),
});

const OrganizationSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: OrganizationSlug,
    logo: z.string().nullish(),
    createdAt: z.date(),
});

const OrganizationName = z.string().trim().min(1).max(100);

export const organizationNotFound = describeErrorResponse(
    { message: "Organization not found" },
    404,
    "No organization with this slug exists that you're a member of",
);

const slugTaken = describeErrorResponse(
    { message: "Organization slug is already taken" },
    409,
    "Organization slug is already taken",
);

const updateForbidden = describeErrorResponse(
    { message: "You can't update this organization" },
    403,
    "Only owners and admins can update an organization",
);

export const organizationsRouter = {
    list: protectedProcedure
        .route({
            operationId: "listOrganizations",
            method: "GET",
            path: "/orgs",
            summary: "List organizations",
            description: "Lists the organizations you're a member of.",
            successDescription: "Your organizations",
            tags: ["Organizations"],
        })
        .output(z.array(OrganizationSchema))
        .handler(({ context }) =>
            listOrganizations(context.auth, context.headers),
        ),
    create: protectedProcedure
        .route({
            operationId: "createOrganization",
            method: "POST",
            path: "/orgs",
            successStatus: 201,
            summary: "Create organization",
            description:
                "Creates an organization with you as its owner. Your active organization in the web app is left unchanged.",
            successDescription: "Organization created",
            tags: ["Organizations"],
        })
        .errors({
            CONFLICT: slugTaken,
            FORBIDDEN: describeErrorResponse(
                { message: "You can't create another organization" },
                403,
                "Organization creation is disabled for you, or you've reached your organization limit",
            ),
        })
        .input(z.object({ name: OrganizationName, slug: OrganizationSlug }))
        .output(OrganizationSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                return await createOrganization(
                    context.auth,
                    context.headers,
                    input,
                );
            } catch (error) {
                if (error instanceof OrganizationSlugTakenError) {
                    throw errors.CONFLICT();
                }
                if (error instanceof OrganizationForbiddenError) {
                    throw errors.FORBIDDEN();
                }
                throw error;
            }
        }),
    get: protectedProcedure
        .route({
            operationId: "getOrganization",
            method: "GET",
            path: "/orgs/{org}",
            summary: "Get organization",
            successDescription: "The organization",
            tags: ["Organizations"],
        })
        .errors({ NOT_FOUND: organizationNotFound })
        .input(OrganizationRef)
        .output(OrganizationSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                return await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
            } catch (error) {
                if (error instanceof OrganizationNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                throw error;
            }
        }),
    update: protectedProcedure
        .route({
            operationId: "updateOrganization",
            method: "PATCH",
            path: "/orgs/{org}",
            summary: "Update organization",
            description:
                "Renames the organization or changes its slug. Only owners and admins can update an organization. After a slug change, use the new slug in paths.",
            successDescription: "Organization updated",
            tags: ["Organizations"],
        })
        .errors({
            NOT_FOUND: organizationNotFound,
            CONFLICT: slugTaken,
            FORBIDDEN: updateForbidden,
        })
        .input(
            OrganizationRef.extend({
                name: OrganizationName.optional(),
                slug: OrganizationSlug.optional(),
            }).refine(
                (input) => input.name !== undefined || input.slug !== undefined,
                { message: "Provide a new name or slug" },
            ),
        )
        .output(OrganizationSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                const target = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                return await updateOrganization(
                    context.auth,
                    context.headers,
                    target,
                    { name: input.name, slug: input.slug },
                );
            } catch (error) {
                if (error instanceof OrganizationNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                if (error instanceof OrganizationSlugTakenError) {
                    throw errors.CONFLICT();
                }
                if (error instanceof OrganizationForbiddenError) {
                    throw errors.FORBIDDEN();
                }
                throw error;
            }
        }),
    setLogo: protectedProcedure
        .route({
            operationId: "setOrganizationLogo",
            method: "PUT",
            path: "/orgs/{org}/logo",
            summary: "Set organization logo",
            description: `Replaces the organization's logo. ${describeImageUpload(ORGANIZATION_LOGO_DIMENSION)} Only owners and admins can change the logo.`,
            successDescription: "Logo updated",
            tags: ["Organizations"],
        })
        .errors({
            NOT_FOUND: organizationNotFound,
            FORBIDDEN: updateForbidden,
            BAD_REQUEST: invalidImage,
        })
        .input(
            OrganizationRef.extend({
                logo: ImageFile,
            }),
        )
        .output(OrganizationSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                const target = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                return await setOrganizationLogo(
                    context.auth,
                    context.storage,
                    context.headers,
                    target,
                    input.logo,
                );
            } catch (error) {
                if (error instanceof OrganizationNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                if (error instanceof OrganizationForbiddenError) {
                    throw errors.FORBIDDEN();
                }
                if (error instanceof InvalidImageError) {
                    throw errors.BAD_REQUEST();
                }
                throw error;
            }
        }),
    delete: protectedProcedure
        .route({
            operationId: "deleteOrganization",
            method: "DELETE",
            path: "/orgs/{org}",
            summary: "Delete organization",
            description:
                "Deletes the organization, its memberships and its pending invitations. Only owners can delete an organization, and only once it has no apps left: destroy them first and wait for teardown to finish.",
            successDescription: "Organization deleted",
            tags: ["Organizations"],
        })
        .errors({
            NOT_FOUND: organizationNotFound,
            FORBIDDEN: describeErrorResponse(
                { message: "You can't delete this organization" },
                403,
                "Only owners can delete an organization",
            ),
            CONFLICT: describeErrorResponse(
                { message: "Organization still has apps" },
                409,
                "The organization still has apps, including ones still being destroyed",
            ),
        })
        .input(OrganizationRef)
        .output(OrganizationSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                const target = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                return await deleteOrganization(
                    context.db,
                    context.auth,
                    context.headers,
                    target,
                );
            } catch (error) {
                if (error instanceof OrganizationNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                if (error instanceof OrganizationForbiddenError) {
                    throw errors.FORBIDDEN();
                }
                if (error instanceof OrganizationHasAppsError) {
                    throw errors.CONFLICT();
                }
                throw error;
            }
        }),
};
