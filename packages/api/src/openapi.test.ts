import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { describe, expect, it } from "vitest";

import { openAPISecuritySchemes, SESSION_COOKIE_SCHEME } from "./openapi";
import { appRouter } from "./routers/index";

const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
});

const spec = await generator.generate(appRouter, {
    components: { securitySchemes: openAPISecuritySchemes },
});

describe("OpenAPI spec", () => {
    it("requires a session for protected procedures", () => {
        const operation = spec.paths?.["/apps"]?.get;

        expect(operation?.security).toEqual([{ [SESSION_COOKIE_SCHEME]: [] }]);
        expect(operation?.responses).toHaveProperty("401");
    });

    it("leaves public procedures open", () => {
        const operation = spec.paths?.["/health"]?.get;

        expect(operation?.security).toBeUndefined();
        expect(operation?.responses).not.toHaveProperty("401");
    });
});
