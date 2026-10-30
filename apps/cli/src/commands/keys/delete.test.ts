import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stderr, stdout } from "../../testing/output";
import { confirmed, confirmYesNo } from "../../ui/prompt";
import remove from "./delete";

vi.mock("../../client", () => ({
    client: { apiKeys: { delete: vi.fn() } },
}));
vi.mock("../../ui/prompt");

const key = {
    id: "key-1",
    name: "ci",
    start: "qlt_ab",
    prefix: "qlt_",
    enabled: true,
    expiresAt: null,
    lastRequest: null,
    createdAt: new Date("2026-06-01T00:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.apiKeys.delete).mockResolvedValue(key);
    vi.mocked(confirmed).mockResolvedValue(true);
});

afterEach(() => {
    vi.resetAllMocks();
    process.exitCode = undefined;
});

describe("keys delete", () => {
    it("deletes the key once confirmed", async () => {
        await runCommand(remove, { rawArgs: ["key-1"] });

        expect(client.apiKeys.delete).toHaveBeenCalledWith({ id: "key-1" });
        expect(stderr()).toContain("Deleted API key ci");
    });

    it("asks a yes/no question naming the key", async () => {
        await runCommand(remove, { rawArgs: ["key-1"] });

        const [yes, ask] = vi.mocked(confirmed).mock.calls[0] ?? [];
        expect(yes).toBe(false);
        await ask?.();
        expect(confirmYesNo).toHaveBeenCalledWith(
            expect.stringContaining("key-1"),
        );
    });

    it("skips the question with --yes", async () => {
        await runCommand(remove, { rawArgs: ["key-1", "--yes"] });

        expect(confirmed).toHaveBeenCalledWith(true, expect.any(Function));
    });

    it("deletes nothing when not confirmed", async () => {
        vi.mocked(confirmed).mockResolvedValue(false);

        await runCommand(remove, { rawArgs: ["key-1"] });

        expect(client.apiKeys.delete).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(remove, { rawArgs: ["key-1", "--yes", "--json"] });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(key)));
    });
});
