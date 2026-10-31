import { stripVTControlCharacters } from "node:util";
import { ORPCError } from "@orpc/client";
import { type ArgsDef, type CommandDef, runCommand } from "citty";

import { describeCommand, findCommand } from "./command-tree";
import { setApiKeyFlag } from "./lib/credentials";
import { renderHelp } from "./ui/help";
import { log } from "./ui/log";
import { theme } from "./ui/theme";

/**
 * Replaces citty's `runMain` so help, version and errors use quilt's theme.
 * Parsing and dispatch are still citty's `runCommand`.
 */
export async function run(
    root: CommandDef<ArgsDef>,
    allArgs = process.argv.slice(2),
) {
    const taken = takeApiKey(allArgs);
    if (!taken) {
        log.error("--api-key needs a key");
        process.exitCode = 1;
        return;
    }
    const { rawArgs, apiKey } = taken;
    setApiKeyFlag(apiKey);

    const meta = await (typeof root.meta === "function"
        ? root.meta()
        : root.meta);

    if (
        rawArgs.length === 0 ||
        rawArgs.some((arg) => arg === "--help" || arg === "-h")
    ) {
        const { path } = await findCommand(root, rawArgs);
        const rootInfo = await describeCommand(root);
        const info = path.reduce(
            (current, name) =>
                current.subCommands.find((sub) => sub.path.at(-1) === name) ??
                current,
            rootInfo,
        );
        console.log(renderHelp(rootInfo, info));
        return;
    }

    if (
        rawArgs.length === 1 &&
        (rawArgs[0] === "--version" || rawArgs[0] === "-v")
    ) {
        console.log(meta?.version);
        return;
    }

    try {
        await runCommand(root, { rawArgs });
    } catch (error) {
        process.exitCode = 1;
        if (error instanceof Error && error.name === "CLIError") {
            // citty colours parts of its messages; restyle them consistently.
            log.error(stripVTControlCharacters(error.message));
            const { path } = await findCommand(root, rawArgs);
            log.hint(
                `Run ${theme.brand([meta?.name, ...path, "--help"].join(" "))} to see usage.`,
            );
            return;
        }
        if (error instanceof ORPCError && error.code === "UNAUTHORIZED") {
            log.error("Not signed in, or your key is no longer valid");
            log.hint(`Run ${theme.brand("quilt login")} to sign in.`);
            return;
        }
        if (error instanceof ORPCError) {
            log.error(error.message);
            for (const issue of validationIssues(error.data)) {
                log.hint(`${issue.path.join(".")}: ${issue.message}`);
            }
            return;
        }
        log.error(
            "Unexpected error",
            error instanceof Error ? error.message : String(error),
        );
    }
}

function takeApiKey(args: string[]) {
    const rawArgs: string[] = [];
    let apiKey: string | undefined;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i] ?? "";
        if (arg === "--api-key" || arg === "-k") {
            apiKey = args[++i];
            if (!apiKey || apiKey.startsWith("-")) return undefined;
        } else if (arg.startsWith("--api-key=")) {
            apiKey = arg.slice("--api-key=".length);
            if (!apiKey) return undefined;
        } else {
            rawArgs.push(arg);
        }
    }
    return { rawArgs, apiKey };
}

type ValidationIssue = { path: (string | number)[]; message: string };

function validationIssues(data: unknown): ValidationIssue[] {
    if (typeof data !== "object" || data === null || !("issues" in data)) {
        return [];
    }
    return Array.isArray(data.issues) ? data.issues : [];
}
