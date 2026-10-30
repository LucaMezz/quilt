import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stderr, stdout } from "../../testing/output";
import { confirmByTyping, confirmed } from "../../ui/prompt";
import remove from "./delete";

vi.mock("../../client", () => ({
    client: { organizations: { delete: vi.fn() } },
}));
vi.mock("../../ui/prompt");

const organization = {
    id: "org-1",
    name: "Acme",
    slug: "acme",
    logo: null,
    createdAt: new Date("2026-01-02T10:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.organizations.delete).mockResolvedValue(organization);
    vi.mocked(confirmed).mockResolvedValue(true);
});

afterEach(() => {
    vi.resetAllMocks();
    process.exitCode = undefined;
});

describe("orgs delete", () => {
    it("deletes the organization once confirmed", async () => {
        await runCommand(remove, { rawArgs: ["acme"] });

        expect(client.organizations.delete).toHaveBeenCalledWith({
            org: "acme",
        });
        expect(stderr()).toContain("Deleted organization Acme");
    });

    it("asks you to type the slug", async () => {
        await runCommand(remove, { rawArgs: ["acme"] });

        const [yes, ask] = vi.mocked(confirmed).mock.calls[0] ?? [];
        expect(yes).toBe(false);
        await ask?.();
        expect(confirmByTyping).toHaveBeenCalledWith("acme");
    });

    it("skips the question with --yes", async () => {
        await runCommand(remove, { rawArgs: ["acme", "--yes"] });

        expect(confirmed).toHaveBeenCalledWith(true, expect.any(Function));
    });

    it("deletes nothing when not confirmed", async () => {
        vi.mocked(confirmed).mockResolvedValue(false);

        await runCommand(remove, { rawArgs: ["acme"] });

        expect(client.organizations.delete).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(remove, { rawArgs: ["acme", "--yes", "--json"] });

        expect(JSON.parse(stdout())).toEqual(
            JSON.parse(JSON.stringify(organization)),
        );
    });
});
