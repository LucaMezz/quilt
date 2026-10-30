import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stderr, stdout } from "../../testing/output";
import list from "./list";

vi.mock("../../client", () => ({
    client: { apiKeys: { list: vi.fn() } },
}));

const NOW = new Date("2026-06-01T00:00:00Z");

function key(overrides: object) {
    return {
        id: "key-1",
        name: "laptop",
        start: "qlt_ab",
        prefix: "qlt_",
        enabled: true,
        expiresAt: new Date("2026-09-01T00:00:00Z"),
        lastRequest: new Date("2026-05-30T00:00:00Z"),
        createdAt: new Date("2026-01-01T00:00:00Z"),
        ...overrides,
    };
}

beforeEach(() => {
    captureOutput();
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
});

afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
});

describe("keys list", () => {
    it("prints a row per key with its status", async () => {
        vi.mocked(client.apiKeys.list).mockResolvedValue({
            items: [
                key({}),
                key({ id: "key-2", name: "ci", enabled: false }),
                key({
                    id: "key-3",
                    name: null,
                    expiresAt: new Date("2026-05-01T00:00:00Z"),
                    lastRequest: null,
                }),
            ],
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: [] });

        const lines = stdout().split("\n");
        expect(lines[0]).toMatch(/NAME\s+ID\s+STATUS\s+EXPIRES\s+LAST USED/);
        expect(lines[1]).toMatch(
            /laptop\s+key-1\s+active\s+2026-09-01\s+2026-05-30/,
        );
        expect(lines[2]).toMatch(/ci\s+key-2\s+disabled/);
        expect(lines[3]).toMatch(/key-3\s+expired\s+2026-05-01\s+never/);
    });

    it("fetches every page", async () => {
        vi.mocked(client.apiKeys.list)
            .mockResolvedValueOnce({ items: [key({})], nextCursor: "next" })
            .mockResolvedValueOnce({
                items: [key({ id: "key-2" })],
                nextCursor: null,
            });

        await runCommand(list, { rawArgs: [] });

        expect(client.apiKeys.list).toHaveBeenLastCalledWith({
            limit: 100,
            cursor: "next",
        });
        expect(stdout()).toContain("key-2");
    });

    it("prints JSON with --json", async () => {
        const items = [key({})];
        vi.mocked(client.apiKeys.list).mockResolvedValue({
            items,
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: ["--json"] });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(items)));
    });

    it("says so when there are no keys", async () => {
        vi.mocked(client.apiKeys.list).mockResolvedValue({
            items: [],
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: [] });

        expect(console.log).not.toHaveBeenCalled();
        expect(stderr()).toContain("You have no API keys");
    });
});
