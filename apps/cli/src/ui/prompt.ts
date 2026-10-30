import { input } from "@inquirer/prompts";

import { log } from "./log";
import { theme } from "./theme";

function cancelledByUser(error: unknown) {
    return error instanceof Error && error.name === "ExitPromptError";
}

export async function confirmByTyping(expected: string) {
    try {
        const answer = await input(
            { message: `Type ${theme.heading(expected)} to confirm:` },
            { output: process.stderr },
        );
        return answer.trim() === expected;
    } catch (error) {
        if (cancelledByUser(error)) return false;
        throw error;
    }
}

export async function confirmed(yes: boolean, ask: () => Promise<boolean>) {
    if (yes) return true;
    if (!process.stdin.isTTY) {
        log.error("Can't ask for confirmation without an interactive terminal");
        log.hint(`Pass ${theme.brand("--yes")} to confirm.`);
        return false;
    }
    if (await ask()) return true;
    log.error("Cancelled");
    return false;
}
