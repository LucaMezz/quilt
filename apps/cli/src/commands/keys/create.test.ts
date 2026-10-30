import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stderr, stdout } from "../../testing/output";
import create from "./create";

vi.mock("../../client", () => ({
    client: { apiKeys: { create: vi.fn() } },
}));

const DAY = 24 * 60 * 60;

const created = {
    id: "key-1",
    name: "ci",
    start: "qlt_ab",
    prefix: "qlt_",
    enabled: true,
    expiresAt: new Date("2026-09-01T00:00:00Z"),
    lastRequest: null,
    createdAt: new Date("2026-06-01T00:00:00Z"),
    key: "qlt_secret",
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.apiKeys.create).mockResolvedValue(created);
});

afterEach(() => {
    vi.resetAllMocks();
    process.exitCode = undefined;
});

describe("keys create", () => {
    it("prints only the key on stdout", async () => {
        await runCommand(create, { rawArgs: ["ci"] });

        expect(client.apiKeys.create).toHaveBeenCalledWith({
            name: "ci",
            expiresIn: 90 * DAY,
        });
        expect(stdout()).toBe("qlt_secret");
        expect(stderr()).toContain("Created API key ci");
        expect(stderr()).toContain("won't be shown again");
    });

    it("takes the lifetime in days", async () => {
        await runCommand(create, { rawArgs: ["ci", "--expires-in", "30"] });

        expect(client.apiKeys.create).toHaveBeenCalledWith({
            name: "ci",
            expiresIn: 30 * DAY,
        });
    });

    it("rejects a lifetime that isn't a whole number of days", async () => {
        await runCommand(create, { rawArgs: ["ci", "--expires-in", "1.5"] });

        expect(client.apiKeys.create).not.toHaveBeenCalled();
        expect(stderr()).toContain("--expires-in");
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(create, { rawArgs: ["ci", "--json"] });

        expect(JSON.parse(stdout())).toEqual(
            JSON.parse(JSON.stringify(created)),
        );
    });
});
