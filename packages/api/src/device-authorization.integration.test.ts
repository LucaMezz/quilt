import { describe, expect } from "vitest";

import { test } from "./testing/fixtures";

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
});
