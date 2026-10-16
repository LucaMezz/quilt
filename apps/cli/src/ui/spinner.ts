import { theme } from "./theme";

const FRAMES = ["◒", "◐", "◓", "◑"];
const INTERVAL_MS = 80;

// Draws on stderr, and only when it's a terminal, so piped output stays clean.
export function spinner(text: string) {
    const stream = process.stderr;
    if (!stream.isTTY) {
        return { stop() {} };
    }

    let frame = 0;
    const render = () => {
        const symbol = theme.brand(FRAMES[frame++ % FRAMES.length]);
        stream.write(`\r\x1b[2K${symbol} ${theme.muted(text)}`);
    };
    const restoreCursor = () => stream.write("\x1b[?25h");

    stream.write("\x1b[?25l");
    process.once("exit", restoreCursor);
    render();
    const timer = setInterval(render, INTERVAL_MS);

    return {
        stop() {
            clearInterval(timer);
            stream.write("\r\x1b[2K");
            restoreCursor();
            process.off("exit", restoreCursor);
        },
    };
}
