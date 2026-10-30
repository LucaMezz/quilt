import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../client";
import { captureOutput, stderr } from "../testing/output";
import { canPrompt, chooseOne } from "../ui/prompt";
import { resolveKey, shortId } from "./key-ref";

vi.mock("../client", () => ({
    client: { apiKeys: { list: vi.fn() } },
}));
vi.mock("../ui/prompt");

function key(id: string, name: string | null) {
    return {
        id,
        name,
        start: "qlt_ab",
        prefix: "qlt_",
        enabled: true,
        expiresAt: null,
        lastRequest: null,
        createdAt: new Date("2026-06-01T00:00:00Z"),
    };
}

const laptop = key("Ab3dEfGhIjKlMnOpQrStUvWxYz012345", "laptop");
const ci = key("Ab3xYz9hIjKlMnOpQrStUvWxYz012345", "ci");
const ciOld = key("Zz9yXw8vIjKlMnOpQrStUvWxYz012345", "ci");
const keys = [laptop, ci, ciOld];

beforeEach(() => {
    captureOutput();
    vi.mocked(client.apiKeys.list).mockResolvedValue({
        items: keys,
        nextCursor: null,
    });
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("shortId", () => {
    it("keeps the first seven characters", () => {
        expect(shortId(laptop.id)).toBe("Ab3dEfG");
    });
});

describe("resolveKey", () => {
    it("finds a key by its full ID", async () => {
        await expect(resolveKey(ciOld.id)).resolves.toBe(ciOld);
    });

    it("finds a key by its name", async () => {
        await expect(resolveKey("laptop")).resolves.toBe(laptop);
    });

    it("finds a key by a unique ID prefix", async () => {
        await expect(resolveKey("Ab3x")).resolves.toBe(ci);
    });

    it("refuses a name shared by several keys, listing their short IDs", async () => {
        await expect(resolveKey("ci")).resolves.toBeUndefined();
        expect(stderr()).toContain('2 API keys are named "ci"');
        expect(stderr()).toContain("Ab3xYz9");
        expect(stderr()).toContain("Zz9yXw8");
    });

    it("refuses an ID prefix shared by several keys", async () => {
        await expect(resolveKey("Ab3")).resolves.toBeUndefined();
        expect(stderr()).toContain('"Ab3" matches 2 API keys');
    });

    it("says when nothing matches", async () => {
        await expect(resolveKey("desktop")).resolves.toBeUndefined();
        expect(stderr()).toContain(
            'No API key named or starting with "desktop"',
        );
        expect(stderr()).toContain("quilt keys list");
    });

    it("lets you pick a key when none is given", async () => {
        vi.mocked(canPrompt).mockReturnValue(true);
        vi.mocked(chooseOne).mockResolvedValue(ci.id);

        await expect(resolveKey(undefined)).resolves.toBe(ci);
        expect(chooseOne).toHaveBeenCalledWith(
            "Which API key?",
            expect.arrayContaining([
                expect.objectContaining({
                    value: ci.id,
                    name: expect.stringContaining("Ab3xYz9"),
                }),
            ]),
        );
    });

    it("needs a key without a terminal to pick in", async () => {
        await expect(resolveKey(undefined)).resolves.toBeUndefined();
        expect(chooseOne).not.toHaveBeenCalled();
        expect(stderr()).toContain("name or ID");
    });

    it("is undefined when the picker is cancelled", async () => {
        vi.mocked(canPrompt).mockReturnValue(true);
        vi.mocked(chooseOne).mockResolvedValue(undefined);

        await expect(resolveKey(undefined)).resolves.toBeUndefined();
        expect(stderr()).toContain("Cancelled");
    });

    it("says when there are no keys to pick from", async () => {
        vi.mocked(canPrompt).mockReturnValue(true);
        vi.mocked(client.apiKeys.list).mockResolvedValue({
            items: [],
            nextCursor: null,
        });

        await expect(resolveKey(undefined)).resolves.toBeUndefined();
        expect(chooseOne).not.toHaveBeenCalled();
        expect(stderr()).toContain("You have no API keys");
    });
});
