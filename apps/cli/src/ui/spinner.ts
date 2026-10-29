import { theme } from "./theme";

const FRAMES = ["◒", "◐", "◓", "◑"];
const INTERVAL_MS = 80;

// Draws on stderr, and only when it's a terminal, so piped output stays clean.
export function spinner(initialText: string) {
    const stream = process.stderr;
    if (!stream.isTTY) {
        return { update(_text: string) {}, stop() {} };
    }

    let text = initialText;
    let frame = 0;
    const render = () => {
        const symbol = theme.brand(FRAMES[frame++ % FRAMES.length]);
        stream.write(`\r\x1b[2K${symbol} ${theme.muted(text)}`);
    };
    const restoreCursor = () => stream.write("\x1b[?25h");
    const interrupt = () => {
        stop();
        process.exit(130);
    };

    const stop = () => {
        clearInterval(timer);
        stream.write("\r\x1b[2K");
        restoreCursor();
        process.off("exit", restoreCursor);
        process.off("SIGINT", interrupt);
    };

    stream.write("\x1b[?25l");
    process.once("exit", restoreCursor);
    process.once("SIGINT", interrupt);
    render();
    const timer = setInterval(render, INTERVAL_MS);

    return {
        update(next: string) {
            text = next;
            render();
        },
        stop,
    };
}
