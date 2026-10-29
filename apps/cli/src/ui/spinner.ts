import ora from "ora";

import { theme } from "./theme";

const FRAMES = ["◒", "◐", "◓", "◑"];

export function spinner(text: string) {
    return ora({
        text,
        color: false,
        discardStdin: false,
        isEnabled: process.stderr.columns === 0 ? false : undefined,
        spinner: {
            frames: FRAMES.map((frame) => theme.brand(frame)),
            interval: 80,
        },
    }).start();
}
