import type { Auth } from "@quilt/auth";
import { describe, expect } from "vitest";

import { resolveCaller } from "./caller";
import { test } from "./testing/fixtures";

async function approvedDeviceToken(auth: Auth, headers: Headers) {
    const code = await auth.api.deviceCode({
        body: { client_id: "quilt-cli" },
    });
    await auth.api.deviceVerify({
        query: { user_code: code.user_code },
        headers,
    });
    await auth.api.deviceApprove({
        body: { userCode: code.user_code },
        headers,
    });
    const token = await auth.api.deviceToken({
        body: {
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            device_code: code.device_code,
            client_id: "quilt-cli",
        },
    });
    return token.access_token;
}

describe("device authorization", () => {
    test("links the CLI to the web app's device page", async ({ auth }) => {
        const code = await auth.api.deviceCode({
            body: { client_id: "quilt-cli" },
        });

        expect(code.verification_uri).toBe("http://localhost:3001/device");
        expect(code.verification_uri_complete).toBe(
            `http://localhost:3001/device?user_code=${code.user_code}`,
        );
    });

    test("accepts the CLI's token as a bearer token", async ({
        auth,
        signUp,
    }) => {
        const { user, headers } = await signUp();
        const token = await approvedDeviceToken(auth, headers);

        const caller = await resolveCaller(
            auth,
            new Headers({ authorization: `Bearer ${token}` }),
        );

        expect(caller?.userId).toBe(user.id);
    });
});
