import {
    CommanderError,
    type CommandUnknownOpts,
} from "@commander-js/extra-typings";
import { ORPCError } from "@orpc/client";

import { hintSignIn, reportPassedKeyRejected } from "./lib/sign-in";
import { log } from "./ui/log";

const SHOWN = new Set([
    "commander.help",
    "commander.helpDisplayed",
    "commander.version",
]);

export async function run(
    root: CommandUnknownOpts,
    args = process.argv.slice(2),
) {
    try {
        await root.parseAsync(args, { from: "user" });
    } catch (error) {
        if (error instanceof CommanderError) {
            process.exitCode = SHOWN.has(error.code) ? 0 : error.exitCode;
            return;
        }
        process.exitCode = 1;
        report(error);
        log.debug(details(error));
    }
}

function report(error: unknown) {
    if (error instanceof ORPCError && error.code === "UNAUTHORIZED") {
        if (!reportPassedKeyRejected()) {
            log.error("Not signed in, or your key is no longer valid");
            hintSignIn();
        }
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

function details(error: unknown) {
    const lines: string[] = [];
    let current = error;
    for (let depth = 0; current !== undefined && depth < 10; depth++) {
        if (depth > 0) lines.push("caused by:");
        lines.push(
            current instanceof Error
                ? (current.stack ?? String(current))
                : String(current),
        );
        if (current instanceof ORPCError) {
            lines.push(`code ${current.code}, status ${current.status}`);
            if (current.data !== undefined) {
                lines.push(`data ${JSON.stringify(current.data)}`);
            }
        }
        current = current instanceof Error ? current.cause : undefined;
    }
    return lines.join("\n");
}

type ValidationIssue = { path: (string | number)[]; message: string };

function validationIssues(data: unknown): ValidationIssue[] {
    if (typeof data !== "object" || data === null || !("issues" in data)) {
        return [];
    }
    return Array.isArray(data.issues) ? data.issues : [];
}
