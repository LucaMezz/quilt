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
    it("requires an API key for protected procedures", () => {
        const operation = spec.paths?.["/orgs/{org}/apps"]?.get;

        expect(operation?.security).toEqual([{ [API_KEY_SCHEME]: [] }]);
        expect(operation?.responses).toHaveProperty("401");
    });

    it("leaves out session-only procedures", () => {
        expect(spec.paths).not.toHaveProperty("/user/api-keys");
        expect(spec.paths?.["/orgs/{org}"]).toHaveProperty("get");
        expect(spec.paths?.["/orgs/{org}"]).not.toHaveProperty("patch");
    });

    it("leaves public procedures open", () => {
        const operation = spec.paths?.["/health"]?.get;

        expect(operation?.security).toBeUndefined();
        expect(operation?.responses).not.toHaveProperty("401");
    });
});
