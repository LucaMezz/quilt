import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "../../client";
import { runCommand } from "../../testing/command";
import { captureOutput, stderr, stdout } from "../../testing/output";
import update from "./update";

vi.mock("../../client", () => ({
    client: { organizations: { update: vi.fn() } },
}));

const organization = {
    id: "org-1",
    name: "Acme Labs",
    slug: "acme-labs",
    logo: null,
    createdAt: new Date("2026-01-02T10:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.organizations.update).mockResolvedValue(organization);
});

afterEach(() => {
    vi.resetAllMocks();
    process.exitCode = undefined;
});

describe("orgs update", () => {
    it("renames the organization", async () => {
        await runCommand(update, { rawArgs: ["acme", "--name", "Acme Labs"] });

        expect(client.organizations.update).toHaveBeenCalledWith({
            org: "acme",
            name: "Acme Labs",
            slug: undefined,
        });
        expect(stderr()).toContain("Updated organization Acme Labs");
    });

    it("changes the slug", async () => {
        await runCommand(update, { rawArgs: ["acme", "--slug", "acme-labs"] });

        expect(client.organizations.update).toHaveBeenCalledWith({
            org: "acme",
            name: undefined,
            slug: "acme-labs",
        });
    });

    it("takes short flags", async () => {
        await runCommand(update, {
            rawArgs: ["acme", "-n", "Acme Labs", "-s", "acme-labs"],
        });

        expect(client.organizations.update).toHaveBeenCalledWith({
            org: "acme",
            name: "Acme Labs",
            slug: "acme-labs",
        });
    });

    it("needs something to change", async () => {
        await runCommand(update, { rawArgs: ["acme"] });

        expect(client.organizations.update).not.toHaveBeenCalled();
        expect(stderr()).toContain("--name or --slug");
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(update, {
            rawArgs: ["acme", "--name", "Acme Labs", "--json"],
        });

        expect(JSON.parse(stdout())).toEqual(
            JSON.parse(JSON.stringify(organization)),
        );
    });
});
