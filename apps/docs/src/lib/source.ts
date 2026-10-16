import { llms, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { openapi } from "./openapi";
import { docsRoute } from "./shared";

const docs = defineDocs({
    dir: "content/docs",
    docs: {
        schema: pageSchema,
        postprocess: {
            includeProcessedMarkdown: true,
        },
    },
    meta: {
        schema: metaSchema,
    },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
// Hand-written MDX pages plus one virtual page per API endpoint, built from the
// OpenAPI spec on every build so the reference can't drift from the router.
export const source = loader(
    {
        docs: docs.toFumadocsSource(),
        openapi: await openapi.staticSource({ baseDir: "api" }),
    },
    {
        baseUrl: docsRoute,
        plugins: [lucideIconsPlugin(), openapi.loaderPlugin()],
    },
);

export const docsLlms = llms(source, {
    renderPage: async (page) => {
        // Only this page's operations, not the whole spec once per endpoint.
        if (page.type === "openapi") {
            const { paths = {} } = page.data.getSchema().bundled;
            const { operations = [] } = page.data.getOpenAPIPageProps();
            const sections = operations.map(
                ({ path, method }) => `## ${method.toUpperCase()} ${path}

\`\`\`json
${JSON.stringify(paths[path]?.[method], null, 2)}
\`\`\``,
            );

            return `# ${page.data.title} (${page.url})

${sections.join("\n\n")}`;
        }

        return `# ${page.data.title} (${page.url})

${await page.data.getText("processed")}`;
    },
});
