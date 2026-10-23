import { setTimeout as sleep } from "node:timers/promises";
import { defineCommand } from "citty";

import { authClient } from "../lib/auth-client";
import {
    LoginDeniedError,
    LoginExpiredError,
    LoginFailedError,
} from "../lib/login-errors";

const CLIENT_ID = "quilt-cli";
const DEVICE_CODE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";

const POLLING_INTERVAL = 5;

async function pollForToken(
    deviceCode: string,
    interval: number,
): Promise<string> {
    let pollingInterval = interval;
    for (;;) {
        await sleep(pollingInterval * 1000);
        const { data, error } = await authClient.device.token({
            grant_type: DEVICE_CODE_GRANT,
            device_code: deviceCode,
            client_id: CLIENT_ID,
        });
        if (data) {
            return data.access_token;
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

export default defineCommand({
    meta: {
        name: "login",
        description: "Sign in to your quilt server from this device",
    },
    async run() {
        const { data, error } = await authClient.device.code({
            client_id: CLIENT_ID,
        });
        if (error !== null || !data) {
            return;
        }
        pollForToken(data.device_code, POLLING_INTERVAL);
    },
});
