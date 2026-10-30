import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stderr, stdout } from "../../testing/output";
import update from "./update";

vi.mock("../../client", () => ({
    client: { apiKeys: { update: vi.fn() } },
}));

const key = {
    id: "key-1",
    name: "ci",
    start: "qlt_ab",
    prefix: "qlt_",
    enabled: false,
    expiresAt: null,
    lastRequest: null,
    createdAt: new Date("2026-06-01T00:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.apiKeys.update).mockResolvedValue(key);
});

afterEach(() => {
    vi.resetAllMocks();
    process.exitCode = undefined;
});

describe("keys update", () => {
    it("renames the key", async () => {
        await runCommand(update, { rawArgs: ["key-1", "--name", "ci"] });

        expect(client.apiKeys.update).toHaveBeenCalledWith({
            id: "key-1",
            name: "ci",
            enabled: undefined,
        });
        expect(stderr()).toContain("Updated API key ci");
    });

    it("disables the key", async () => {
        await runCommand(update, { rawArgs: ["key-1", "--disable"] });

        expect(client.apiKeys.update).toHaveBeenCalledWith({
            id: "key-1",
            name: undefined,
            enabled: false,
        });
    });

    it("enables the key", async () => {
        await runCommand(update, { rawArgs: ["key-1", "--enable"] });

        expect(client.apiKeys.update).toHaveBeenCalledWith({
            id: "key-1",
            name: undefined,
            enabled: true,
        });
    });

    it("refuses --enable and --disable together", async () => {
        await runCommand(update, {
            rawArgs: ["key-1", "--enable", "--disable"],
        });

        expect(client.apiKeys.update).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("needs something to change", async () => {
        await runCommand(update, { rawArgs: ["key-1"] });

        expect(client.apiKeys.update).not.toHaveBeenCalled();
        expect(stderr()).toContain("--name, --enable or --disable");
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(update, { rawArgs: ["key-1", "--disable", "--json"] });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(key)));
    });
});
