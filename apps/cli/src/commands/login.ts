import { defineCommand } from "citty";

import { serverHost } from "../client";
import { canOpenBrowser, openBrowser } from "../lib/browser";
import { pollForToken, requestDeviceCode } from "../lib/device-auth";
import { LoginError } from "../lib/login-errors";
import { log } from "../ui/log";
import { spinner } from "../ui/spinner";
import { symbols, theme } from "../ui/theme";

function formatUserCode(code: string) {
    return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

function waitingText(expiresAt: number) {
    const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    const remaining = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    return `Waiting for approval in your browser  ${symbols.dot}  expires in ${remaining}`;
}

function printInstructions(userCode: string, url: string, opened: boolean) {
    console.error(
        [
            "",
            `  ${theme.brandBold(`${symbols.logo} quilt`)}  ${theme.muted(`Sign in to ${serverHost}`)}`,
            "",
            `  ${theme.heading("Your one-time code")}   ${theme.code.bold(formatUserCode(userCode))}`,
            "",
            opened
                ? `  ${theme.muted(symbols.pointer)} Opened your browser. Check it shows the same code, then approve.`
                : `  ${theme.muted(symbols.pointer)} Open this link, check it shows the same code, then approve:`,
            `    ${theme.link(url)}`,
            "",
        ].join("\n"),
    );
}

async function login(browser: boolean) {
    const contacting = spinner(`Contacting ${serverHost}…`);
    const code = await requestDeviceCode().finally(() => contacting.stop());

    const opened =
        browser &&
        canOpenBrowser() &&
        (await openBrowser(code.verification_uri_complete));
    printInstructions(code.user_code, code.verification_uri_complete, opened);

    const expiresAt = Date.now() + code.expires_in * 1000;
    const waiting = spinner(waitingText(expiresAt));
    const ticker = setInterval(() => {
        waiting.text = waitingText(expiresAt);
    }, 1000);
    const { user } = await pollForToken(
        code.device_code,
        code.interval,
    ).finally(() => {
        clearInterval(ticker);
        waiting.stop();
    });

    log.success(
        user ? `Signed in as ${theme.heading(user.name)}` : "Signed in",
        [user?.email, serverHost].filter(Boolean).join(` ${symbols.dot} `),
    );
}

export default defineCommand({
    meta: {
        name: "login",
        description: "Sign in to your quilt server from this device",
    },
    args: {
        browser: {
            type: "boolean",
            default: true,
            description: "Open the sign-in page in your browser",
            negativeDescription: "Print the sign-in link instead of opening it",
        },
    },
    async run({ args }) {
        try {
            await login(args.browser);
        } catch (error) {
            if (!(error instanceof LoginError)) throw error;
            log.error(error.message);
            log.hint(`Run ${theme.brand("quilt login")} to try again.`);
            process.exitCode = 1;
        }
    },
});
