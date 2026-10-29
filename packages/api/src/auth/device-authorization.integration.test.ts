import type { Auth } from "@quilt/auth";
import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { session } from "@quilt/db/schema/auth";
import { eq } from "drizzle-orm";
import { describe, expect } from "vitest";

import { resolveCaller } from "../caller";
import { test } from "../testing/fixtures";

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
    return auth.api.deviceToken({
        body: {
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            device_code: code.device_code,
            client_id: "quilt-cli",
        },
    });
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

    test("gives the CLI an API key for the approving user", async ({
        auth,
        signUp,
    }) => {
        const { user, headers } = await signUp();

        const token = await approvedDeviceToken(auth, headers);

        const caller = await resolveCaller(
            auth,
            new Headers({ [API_KEY_HEADER]: token.access_token }),
        );
        expect(caller).toMatchObject({ kind: "apiKey", userId: user.id });
        const { apiKeys } = await auth.api.listApiKeys({ headers });
        expect(apiKeys.map((key) => key.name)).toEqual(["quilt CLI"]);
    });

    test("leaves no session behind for the CLI", async ({
        auth,
        db,
        signUp,
    }) => {
        const { user, headers } = await signUp();

        await approvedDeviceToken(auth, headers);

        const sessions = await db
            .select()
            .from(session)
            .where(eq(session.userId, user.id));
        expect(sessions).toHaveLength(1);
    });
});
