import { readFileSync } from "node:fs";
import { parseAllDocuments } from "yaml";

const sha512 = /^sha512-[A-Za-z0-9+/]{86}==$/;

const packages = parseAllDocuments(readFileSync("pnpm-lock.yaml", "utf8"))
    .map((document) => document.toJS())
    .flatMap((lockfile) => Object.entries(lockfile.packages ?? {}));

function problemsWith(id, resolution) {
    if (!resolution) {
        return [`${id}: has no resolution`];
    }
    const sources = Object.keys(resolution).filter(
        (key) => key !== "integrity",
    );
    if (sources.length > 0) {
        return [
            `${id}: resolves from ${sources.join(", ")} instead of the npm registry`,
        ];
    }
    if (!sha512.test(resolution.integrity ?? "")) {
        return [`${id}: has no sha512 integrity hash`];
    }
    return [];
}

const problems = packages.flatMap(([id, { resolution }]) =>
    problemsWith(id, resolution),
);

if (problems.length > 0) {
    process.stderr.write(
        `pnpm-lock.yaml has ${problems.length} problem(s):\n${problems.map((line) => `  ${line}`).join("\n")}\n`,
    );
    process.exitCode = 1;
} else {
    process.stdout.write(
        `All ${packages.length} packages in pnpm-lock.yaml come from the npm registry with a sha512 hash.\n`,
    );
}
