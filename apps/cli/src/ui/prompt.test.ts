import { input } from "@inquirer/prompts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captureOutput, stderr } from "../testing/output";
import { confirmByTyping, confirmed } from "./prompt";

vi.mock("@inquirer/prompts");

function setTTY(value: boolean) {
    Object.defineProperty(process.stdin, "isTTY", {
        value,
        configurable: true,
    });
}

class ExitPromptError extends Error {
    override name = "ExitPromptError";
}

beforeEach(() => {
    captureOutput();
    setTTY(true);
});

afterEach(() => {
    vi.resetAllMocks();
    setTTY(false);
});

describe("confirmByTyping", () => {
    it("is true when the typed text matches", async () => {
        vi.mocked(input).mockResolvedValue("acme");

        await expect(confirmByTyping("acme")).resolves.toBe(true);
        expect(input).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining("acme"),
            }),
            { output: process.stderr },
        );
    });

    it("is false when the typed text differs", async () => {
        vi.mocked(input).mockResolvedValue("acm");

        await expect(confirmByTyping("acme")).resolves.toBe(false);
    });

    it("is false when the prompt is cancelled with Ctrl+C", async () => {
        vi.mocked(input).mockRejectedValue(new ExitPromptError());

        await expect(confirmByTyping("acme")).resolves.toBe(false);
    });
});

describe("confirmed", () => {
    it("doesn't ask with --yes", async () => {
        const ask = vi.fn();

        await expect(confirmed(true, ask)).resolves.toBe(true);
        expect(ask).not.toHaveBeenCalled();
    });

    it("asks when it can prompt", async () => {
        await expect(confirmed(false, async () => true)).resolves.toBe(true);
    });

    it("refuses without a terminal to ask in", async () => {
        setTTY(false);
        const ask = vi.fn();

        await expect(confirmed(false, ask)).resolves.toBe(false);
        expect(ask).not.toHaveBeenCalled();
        expect(stderr()).toContain("--yes");
    });

    it("says so when the answer is no", async () => {
        await expect(confirmed(false, async () => false)).resolves.toBe(false);
        expect(stderr()).toContain("Cancelled");
    });
});
