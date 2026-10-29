import { API_KEY_HEADER } from "@quilt/auth/api-keys";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client, serverHost } from "./client";
import { getToken } from "./lib/credentials";

vi.mock("./lib/credentials");

const fetch = vi.hoisted(() => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal("fetch", fetch);
    return fetch;
});

function sentRequest() {
    const [request] = fetch.mock.calls[0] ?? [];
    if (!(request instanceof Request)) throw new Error("No request was sent");
    return request;
}

beforeEach(() => {
    fetch.mockResolvedValue(Response.json({ json: "OK" }));
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("client", () => {
    it("sends the stored API key", async () => {
        vi.mocked(getToken).mockReturnValue("qlt_key");

        await client.healthCheck();

        expect(getToken).toHaveBeenCalledWith(serverHost);
        expect(sentRequest().headers.get(API_KEY_HEADER)).toBe("qlt_key");
    });

    it("sends no API key when signed out", async () => {
        await client.healthCheck();

        expect(sentRequest().headers.has(API_KEY_HEADER)).toBe(false);
    });
});
