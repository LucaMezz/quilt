import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cruise } from "dependency-cruiser";
import config from "../.dependency-cruiser.mjs";

const workspaces = ["apps", "packages"].flatMap((dir) =>
    readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(dir, entry.name))
        .filter((workspace) => existsSync(join(workspace, "tsconfig.json"))),
);

function aliasesOf(workspace) {
    const tsconfig = JSON.parse(
        readFileSync(join(workspace, "tsconfig.json"), "utf8"),
    );
    const paths = Object.entries(tsconfig.compilerOptions?.paths ?? {});
    return Object.fromEntries(
        paths.map(([name, [target]]) => [
            name.replace(/\/\*$/, ""),
            resolve(workspace, target.replace(/\/\*$/, "")),
        ]),
    );
}

let failed = false;
for (const workspace of workspaces) {
    const { output, exitCode } = await cruise(
        [workspace],
        {
            ...config.options,
            ruleSet: { forbidden: config.forbidden },
            validate: true,
            outputType: "err",
        },
        { alias: aliasesOf(workspace) },
    );
    process.stdout.write(`${workspace}: ${output.trim()}\n`);
    failed ||= exitCode > 0;
}
process.exitCode = failed ? 1 : 0;
