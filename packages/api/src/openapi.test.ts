import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { describe, expect, it } from "vitest";

import { API_KEY_SCHEME, openAPIGenerateOptions } from "./openapi";
import { appRouter } from "./routers/index";

const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
});

const spec = await generator.generate(appRouter, openAPIGenerateOptions);

describe("OpenAPI spec", () => {
    it("keeps operation IDs stable", () => {
        const methods = ["get", "post", "put", "patch", "delete"] as const;
        const operationIds = Object.values(spec.paths ?? {}).flatMap((item) =>
            methods.flatMap((method) => item?.[method]?.operationId ?? []),
        );

        expect(operationIds.sort()).toEqual([
            "createApiKey",
            "createApp",
            "createOrganization",
            "deleteApiKey",
            "deleteOrganization",
            "destroyApp",
            "getApiKey",
            "getOrganization",
            "healthCheck",
            "listApiKeys",
            "listApps",
            "listOrganizations",
            "setAppLogo",
            "setOrganizationLogo",
            "setUserImage",
            "updateApiKey",
            "updateOrganization",
        ]);
    });

    it("requires an API key for protected procedures", () => {
        const operation = spec.paths?.["/orgs/{org}/apps"]?.get;

        expect(operation?.security).toEqual([{ [API_KEY_SCHEME]: [] }]);
        expect(operation?.responses).toHaveProperty("401");
    });

    it("documents organization and API key procedures", () => {
        expect(spec.paths?.["/user/api-keys"]?.get?.security).toEqual([
            { [API_KEY_SCHEME]: [] },
        ]);
        expect(spec.paths?.["/orgs/{org}"]?.patch?.security).toEqual([
            { [API_KEY_SCHEME]: [] },
        ]);
    });

    it("leaves public procedures open", () => {
        const operation = spec.paths?.["/health"]?.get;

        expect(operation?.security).toBeUndefined();
        expect(operation?.responses).not.toHaveProperty("401");
    });
});
