import ora from "ora";

import { isDebugging } from "./log";
import { theme } from "./theme";

const FRAMES = ["◒", "◐", "◓", "◑"];

export function spinner(text: string) {
    return ora({
        text,
        color: false,
        discardStdin: false,
        isEnabled:
            process.stderr.columns === 0 || isDebugging() ? false : undefined,
        spinner: {
            frames: FRAMES.map((frame) => theme.brand(frame)),
            interval: 80,
        },
    }).start();
}

export function withSpinner<T>(text: string, task: Promise<T>) {
    const progress = spinner(text);
    return task.finally(() => progress.stop());
}
