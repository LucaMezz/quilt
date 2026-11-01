import { confirm, input, select } from "@inquirer/prompts";

import { log } from "./log";
import { theme } from "./theme";

function cancelledByUser(error: unknown) {
    return error instanceof Error && error.name === "ExitPromptError";
}

async function falseOnCancel(prompt: Promise<boolean>) {
    try {
        return await prompt;
    } catch (error) {
        if (cancelledByUser(error)) return false;
        throw error;
    }
}

export function canPrompt() {
    return Boolean(process.stdin.isTTY);
}

export function confirmByTyping(expected: string) {
    return falseOnCancel(
        input(
            { message: `Type ${theme.heading(expected)} to confirm:` },
            { output: process.stderr },
        ).then((answer) => answer.trim() === expected),
    );
}

export function confirmYesNo(message: string) {
    return falseOnCancel(
        confirm({ message, default: false }, { output: process.stderr }),
    );
}

export async function confirmed(
    yes: boolean | undefined,
    ask: () => Promise<boolean>,
) {
    if (yes) return true;
    if (!canPrompt()) {
        log.error("Can't ask for confirmation without an interactive terminal");
        log.hint(`Pass ${theme.brand("--yes")} to confirm.`);
        return false;
    }
    if (await ask()) return true;
    log.error("Cancelled");
    return false;
}

export async function chooseOne<T>(
    message: string,
    choices: { name: string; value: T }[],
) {
    try {
        return await select({ message, choices }, { output: process.stderr });
    } catch (error) {
        if (cancelledByUser(error)) return undefined;
        throw error;
    }
}
