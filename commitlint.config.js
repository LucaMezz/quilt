import { readdirSync } from "node:fs";

// Each app and package is a valid scope (e.g. `feat(cli): …`), read from disk so
// new workspaces are picked up automatically. The rest cover repo-wide changes.
const workspaceScopes = ["apps", "packages"].flatMap((dir) =>
    readdirSync(new URL(`./${dir}`, import.meta.url), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
);

const repoScopes = ["deploy", "deps", "ci", "release", "repo"];

/** @type {import("@commitlint/types").UserConfig} */
export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "scope-enum": [2, "always", [...workspaceScopes, ...repoScopes]],
    },
};
