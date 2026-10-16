// Writes the public API's OpenAPI spec to packages/api/openapi.json, straight from
// the router, so the docs site can build without a running server or database.
import { writeFile } from "node:fs/promises";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

import { appRouter } from "../src/routers/index";

const serverUrl =
    process.env.QUILT_API_URL ?? "http://localhost:3000/api-reference";

const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
});

const spec = await generator.generate(appRouter, {
    info: { title: "quilt API", version: "0.0.0" },
    servers: [{ url: serverUrl }],
});

const output = new URL("../openapi.json", import.meta.url);
await writeFile(output, `${JSON.stringify(spec, null, 4)}\n`);
console.log(`Wrote ${output.pathname}`);
