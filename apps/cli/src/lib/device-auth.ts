import { setTimeout as sleep } from "node:timers/promises";

import { serverHost } from "../client";
import { authClient } from "./auth-client";
import {
    LoginDeniedError,
    LoginExpiredError,
    LoginFailedError,
} from "./login-errors";

const CLIENT_ID = "quilt-cli";
const DEVICE_CODE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";

async function callServer<T>(request: () => Promise<T>) {
    try {
        return await request();
    } catch {
        throw new LoginFailedError(`Could not reach ${serverHost}`);
    }
}

export async function requestDeviceCode() {
    const { data, error } = await callServer(() =>
        authClient.device.code({ client_id: CLIENT_ID }),
    );
    if (error) {
        throw new LoginFailedError(error.error_description);
    }
    return data;
}

export async function pollForToken(deviceCode: string, interval: number) {
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
