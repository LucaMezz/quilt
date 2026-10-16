import { stripVTControlCharacters } from "node:util";
import { type ArgsDef, type CommandDef, runCommand } from "citty";

import { findCommand, renderHelp } from "./ui/help";
import { log } from "./ui/log";
import { theme } from "./ui/theme";

/**
 * Replaces citty's `runMain` so help, version and errors use quilt's theme.
 * Parsing and dispatch are still citty's `runCommand`.
 */
export async function run(
    root: CommandDef<ArgsDef>,
    rawArgs = process.argv.slice(2),
) {
    const meta = await (typeof root.meta === "function"
        ? root.meta()
        : root.meta);

    if (
        rawArgs.length === 0 ||
        rawArgs.some((arg) => arg === "--help" || arg === "-h")
    ) {
        const { cmd, path } = await findCommand(root, rawArgs);
        console.log(await renderHelp(root, cmd, path));
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
        log.error(
            "Unexpected error",
            error instanceof Error ? error.message : String(error),
        );
    }
}
