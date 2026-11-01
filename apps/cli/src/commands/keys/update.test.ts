import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "../../client";
import { resolveKey } from "../../lib/key-ref";
import { runCommand } from "../../testing/command";
import { captureOutput, stderr, stdout } from "../../testing/output";
import update from "./update";

vi.mock("../../lib/key-ref");
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
    vi.mocked(resolveKey).mockResolvedValue(key);
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

    it("takes the new name with -n", async () => {
        await runCommand(update, { rawArgs: ["key-1", "-n", "ci"] });

        expect(client.apiKeys.update).toHaveBeenCalledWith({
            id: "key-1",
            name: "ci",
            enabled: undefined,
        });
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
        expect(resolveKey).not.toHaveBeenCalled();
        expect(stderr()).toContain("--name, --enable or --disable");
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(update, { rawArgs: ["key-1", "--disable", "--json"] });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(key)));
    });

    it("looks the key up by name or ID", async () => {
        await runCommand(update, { rawArgs: ["laptop", "--disable"] });

        expect(resolveKey).toHaveBeenCalledWith("laptop");
        expect(client.apiKeys.update).toHaveBeenCalledWith(
            expect.objectContaining({ id: "key-1" }),
        );
    });

    it("lets you pick the key when none is given", async () => {
        await runCommand(update, { rawArgs: ["--disable"] });

        expect(resolveKey).toHaveBeenCalledWith(undefined);
    });

    it("stops when the key can't be found", async () => {
        vi.mocked(resolveKey).mockResolvedValue(undefined);

        await runCommand(update, { rawArgs: ["nope", "--disable"] });

        expect(client.apiKeys.update).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });
});
