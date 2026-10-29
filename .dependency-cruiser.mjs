/** @type {import("dependency-cruiser").IConfiguration} */
export default {
    forbidden: [
        {
            name: "no-circular",
            severity: "error",
            from: {},
            to: { circular: true },
        },
        {
            name: "no-package-to-app",
            severity: "error",
            from: { path: "^packages/" },
            to: { path: "^apps/" },
        },
        {
            name: "no-app-to-app",
            severity: "error",
            from: { path: "^apps/([^/]+)/", pathNot: "^apps/(e2e|docs)/" },
            to: { path: "^apps/", pathNot: "^apps/$1/" },
        },
        {
            name: "e2e-only-boots-server-and-controller",
            severity: "error",
            from: { path: "^apps/e2e/" },
            to: { path: "^apps/", pathNot: "^apps/(e2e|server|controller)/" },
        },
        {
            name: "docs-scripts-only-read-cli",
            severity: "error",
            from: { path: "^apps/docs/scripts/" },
            to: { path: "^apps/", pathNot: "^apps/(docs|cli)/" },
        },
        {
            name: "docs-site-not-to-apps",
            severity: "error",
            from: { path: "^apps/docs/", pathNot: "^apps/docs/scripts/" },
            to: { path: "^apps/", pathNot: "^apps/docs/" },
        },
        {
            name: "not-to-unresolvable",
            severity: "error",
            from: {},
            to: { couldNotResolve: true, pathNot: "routeTree\\.gen$" },
        },
    ],
    options: {
        parser: "swc",
        doNotFollow: { path: "node_modules" },
        exclude: {
            path: "(^|/)(node_modules|dist|coverage|\\.next|\\.source)/",
        },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default", "types"],
            mainFields: ["module", "main", "types"],
        },
    },
};
