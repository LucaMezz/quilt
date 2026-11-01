import { stripVTControlCharacters } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setDebugFlag } from "../ui/log";
import { debugFetch } from "./debug-fetch";

const fetch = vi.fn<typeof globalThis.fetch>();

function printed() {
    return stripVTControlCharacters(
        vi
            .mocked(console.error)
            .mock.calls.map((args) => args.join(" "))
            .join("\n"),
    );
}

beforeEach(() => {
    vi.stubGlobal("fetch", fetch);
    vi.stubEnv("QUILT_DEBUG", undefined);
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockResolvedValue(new Response(null, { status: 201 }));
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetch.mockReset();
    setDebugFlag(false);
});

describe("debugFetch", () => {
    it("only fetches when not debugging", async () => {
        const response = await debugFetch("https://quilt.test/rpc/apps/list");

        expect(response.status).toBe(201);
        expect(console.error).not.toHaveBeenCalled();
    });

    it("logs each request's method, path and status", async () => {
        setDebugFlag(true);

        await debugFetch(
            new Request("https://quilt.test/rpc/apps/list?secret=1", {
                method: "POST",
                headers: { "x-api-key": "qlt_secret" },
            }),
        );

        expect(printed()).toMatch(
            /^debug POST \/rpc\/apps\/list → 201 in \d+ms$/,
        );
        expect(printed()).not.toContain("secret");
    });

    it("logs a request that fails and rethrows", async () => {
        setDebugFlag(true);
        const failure = new TypeError("fetch failed");
        fetch.mockRejectedValue(failure);

        await expect(
            debugFetch("https://quilt.test/api/auth/get-session"),
        ).rejects.toBe(failure);
        expect(printed()).toMatch(
            /^debug GET \/api\/auth\/get-session failed after \d+ms: fetch failed$/,
        );
    });

    it.each([
        ["1", true],
        ["true", true],
        ["0", false],
        ["false", false],
    ])("treats QUILT_DEBUG=%s as debugging: %s", async (value, logged) => {
        vi.stubEnv("QUILT_DEBUG", value);

        await debugFetch("https://quilt.test/rpc/health");

        expect(printed().includes("debug GET /rpc/health")).toBe(logged);
    });
});
