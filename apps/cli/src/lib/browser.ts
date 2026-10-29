import { spawn } from "node:child_process";

function opener(url: string): [string, string[]] {
    switch (process.platform) {
        case "darwin":
            return ["open", [url]];
        case "win32":
            return ["rundll32", ["url.dll,FileProtocolHandler", url]];
        default:
            return ["xdg-open", [url]];
    }
}

export function canOpenBrowser() {
    return (
        Boolean(process.stderr.isTTY) &&
        !process.env.SSH_CONNECTION &&
        !process.env.CI
    );
}

export function openBrowser(url: string) {
    const [command, args] = opener(url);
    return new Promise<boolean>((resolve) => {
        const child = spawn(command, args, {
            stdio: "ignore",
            detached: true,
        });
        child.once("error", () => resolve(false));
        child.once("spawn", () => {
            child.unref();
            resolve(true);
        });
    });
}
