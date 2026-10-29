import { z } from "zod";
import { InvalidImageError } from "../lib/images";
import { PageInput, pageOf } from "../lib/pagination";
import { describeErrorResponse } from "../openapi";
import { protectedProcedure } from "../procedures";
import {
    APP_LOGO_DIMENSION,
    AppNameTakenError,
    AppNotFoundError,
    createApp,
    destroyApp,
    getOwnedApp,
    listApps,
    setAppLogo,
} from "../services/apps";
import {
    getMemberOrganization,
    OrganizationNotFoundError,
} from "../services/organizations";
import { OrganizationRef, organizationNotFound } from "./organizations";
import { describeImageUpload, ImageFile, invalidImage } from "./shared/images";

const AppName = z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
    .describe(
        "Identifies the app in API paths and CLI commands. Unique across all apps, not just your organization's, and can't be changed later.",
    );

const AppStatus = z
    .enum(["pending", "running", "sleeping", "destroying"])
    .describe(
        "`pending`: created, nothing live yet. `running`: serving traffic. `sleeping`: scaled to zero, wakes on the next request. `destroying`: being torn down.",
    );

const AppSchema = z.object({
    id: z.string(),
    name: AppName,
    hostname: z.string().describe("Public hostname the app is served on"),
    logo: z
        .string()
        .nullable()
        .describe("Storage key of the app's logo; `null` until one is set"),
    status: AppStatus,
    liveDeploymentId: z
        .string()
        .nullable()
        .describe(
            "Deployment currently serving traffic; `null` until the first deploy",
        ),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const AppRef = OrganizationRef.extend({ name: AppName });

const appNotFound = describeErrorResponse(
    { message: "App not found" },
    404,
    "No app with this name exists in an organization you're a member of",
);

export const appsRouter = {
    create: protectedProcedure
        .route({
            operationId: "createApp",
            method: "POST",
            path: "/orgs/{org}/apps",
            successStatus: 201,
            summary: "Create app",
            description:
                "Registers a new app in the organization and reserves its name and hostname. Nothing is deployed until you create a deployment.",
            successDescription: "App created",
            tags: ["Apps"],
        })
        .errors({
            NOT_FOUND: organizationNotFound,
            CONFLICT: describeErrorResponse(
                { message: "App name is already taken" },
                409,
                "App name is already taken",
            ),
        })
        .input(AppRef)
        .output(AppSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                const organization = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                return await createApp(
                    context.db,
                    { organizationId: organization.id, name: input.name },
                    context.appsDomain,
                );
            } catch (error) {
                if (error instanceof OrganizationNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                if (error instanceof AppNameTakenError) throw errors.CONFLICT();
                throw error;
            }
        }),
    destroy: protectedProcedure
        .route({
            operationId: "destroyApp",
            method: "DELETE",
            path: "/orgs/{org}/apps/{name}",
            successStatus: 202,
            summary: "Destroy app",
            description:
                "Starts tearing down the app and its deployments. Returns immediately with status `destroying`; the app disappears from listings once teardown finishes. Calling it again while destroying returns the same response.",
            successDescription: "Destruction started",
            tags: ["Apps"],
        })
        .errors({ NOT_FOUND: appNotFound })
        .input(AppRef)
        .output(AppSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                const organization = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                return await destroyApp(context.db, {
                    organizationId: organization.id,
                    name: input.name,
                });
            } catch (error) {
                if (
                    error instanceof OrganizationNotFoundError ||
                    error instanceof AppNotFoundError
                ) {
                    throw errors.NOT_FOUND();
                }
                throw error;
            }
        }),
    setLogo: protectedProcedure
        .route({
            operationId: "setAppLogo",
            method: "PUT",
            path: "/orgs/{org}/apps/{name}/logo",
            summary: "Set app logo",
            description: `Replaces the app's logo. ${describeImageUpload(APP_LOGO_DIMENSION)} Any member of the organization can change it.`,
            successDescription: "Logo updated",
            tags: ["Apps"],
        })
        .errors({ NOT_FOUND: appNotFound, BAD_REQUEST: invalidImage })
        .input(AppRef.extend({ logo: ImageFile }))
        .output(AppSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                const organization = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                const target = await getOwnedApp(context.db, {
                    organizationId: organization.id,
                    name: input.name,
                });
                return await setAppLogo(
                    context.db,
                    context.storage,
                    target,
                    input.logo,
                );
            } catch (error) {
                if (
                    error instanceof OrganizationNotFoundError ||
                    error instanceof AppNotFoundError
                ) {
                    throw errors.NOT_FOUND();
                }
                if (error instanceof InvalidImageError) {
                    throw errors.BAD_REQUEST();
                }
                throw error;
            }
        }),
    list: protectedProcedure
        .route({
            operationId: "listApps",
            method: "GET",
            path: "/orgs/{org}/apps",
            summary: "List apps",
            description:
                "Lists the organization's apps, newest first, including ones still being destroyed. Results are paginated: pass `nextCursor` back as `cursor` to get the next page.",
            successDescription: "A page of the organization's apps",
            tags: ["Apps"],
        })
        .errors({ NOT_FOUND: organizationNotFound })
        .input(PageInput.extend(OrganizationRef.shape))
        .output(pageOf(AppSchema))
        .handler(async ({ input, context, errors }) => {
            try {
                const organization = await getMemberOrganization(
                    context.db,
                    context.caller.userId,
                    input.org,
                );
                return await listApps(context.db, organization.id, input);
            } catch (error) {
                if (error instanceof OrganizationNotFoundError) {
                    throw errors.NOT_FOUND();
                }
                throw error;
            }
        }),
};
