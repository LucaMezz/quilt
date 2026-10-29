import { setTimeout as sleep } from "node:timers/promises";
import { defineCommand } from "citty";

import { serverUrl } from "../client";
import { authClient } from "../lib/auth-client";
import { canOpenBrowser, openBrowser } from "../lib/browser";
import {
    LoginDeniedError,
    LoginError,
    LoginExpiredError,
    LoginFailedError,
} from "../lib/login-errors";
import { log } from "../ui/log";
import { spinner } from "../ui/spinner";
import { symbols, theme } from "../ui/theme";

const CLIENT_ID = "quilt-cli";
const DEVICE_CODE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";

const host = new URL(serverUrl).host;

async function callServer<T>(request: () => Promise<T>) {
    try {
        return await request();
    } catch {
        throw new LoginFailedError(`Could not reach ${host}`);
    }
}

async function requestDeviceCode() {
    const { data, error } = await callServer(() =>
        authClient.device.code({ client_id: CLIENT_ID }),
    );
    if (error) {
        throw new LoginFailedError(error.error_description);
    }
    return data;
}

async function pollForToken(deviceCode: string, interval: number) {
    let pollingInterval = interval;
    for (;;) {
        await sleep(pollingInterval * 1000);
        const { data, error } = await callServer(() =>
            authClient.device.token({
                grant_type: DEVICE_CODE_GRANT,
                device_code: deviceCode,
                client_id: CLIENT_ID,
            }),
        );
        if (data) {
            const { data: session } = await authClient.getSession({
                fetchOptions: {
                    headers: { authorization: `Bearer ${data.access_token}` },
                },
            });
            return { accessToken: data.access_token, user: session?.user };
        }

        switch (error.error) {
            case "authorization_pending":
                break;
            case "slow_down":
                pollingInterval += 5;
                break;
            case "access_denied":
                throw new LoginDeniedError();
            case "expired_token":
                throw new LoginExpiredError();
            default:
                throw new LoginFailedError(error.error_description);
        }
    }
}

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
            `  ${theme.brandBold(`${symbols.logo} quilt`)}  ${theme.muted(`Sign in to ${host}`)}`,
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
    const contacting = spinner(`Contacting ${host}…`);
    const code = await requestDeviceCode().finally(() => contacting.stop());

    const opened =
        browser &&
        canOpenBrowser() &&
        (await openBrowser(code.verification_uri_complete));
    printInstructions(code.user_code, code.verification_uri_complete, opened);

    const expiresAt = Date.now() + code.expires_in * 1000;
    const waiting = spinner(waitingText(expiresAt));
    const ticker = setInterval(
        () => waiting.update(waitingText(expiresAt)),
        1000,
    );
    const { user } = await pollForToken(
        code.device_code,
        code.interval,
    ).finally(() => {
        clearInterval(ticker);
        waiting.stop();
    });

    log.success(
        user ? `Signed in as ${theme.heading(user.name)}` : "Signed in",
        [user?.email, host].filter(Boolean).join(` ${symbols.dot} `),
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
