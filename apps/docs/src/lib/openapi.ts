import path from "node:path";
import { createOpenAPI } from "fumadocs-openapi/server";

// Generated from the router by `npm run generate:openapi -w @quilt/api`;
// turbo runs that before the docs build and dev tasks.
export const openapi = createOpenAPI({
    input: [path.resolve(process.cwd(), "../../packages/api/openapi.json")],
});
