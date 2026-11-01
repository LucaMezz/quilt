import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "../../client";
import { runCommand } from "../../testing/command";
import { captureOutput, stderr, stdout } from "../../testing/output";
import create from "./create";

vi.mock("../../client", () => ({
    client: { organizations: { create: vi.fn() } },
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
    vi.mocked(client.organizations.create).mockResolvedValue(organization);
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("orgs create", () => {
    it("derives the slug from the name", async () => {
        await runCommand(create, { rawArgs: ["Acme Labs"] });

        expect(client.organizations.create).toHaveBeenCalledWith({
            name: "Acme Labs",
            slug: "acme-labs",
        });
        expect(stderr()).toContain("Created organization Acme Labs");
        expect(console.log).not.toHaveBeenCalled();
    });

    it("uses the slug given with --slug", async () => {
        await runCommand(create, { rawArgs: ["Acme Labs", "--slug", "acme"] });

        expect(client.organizations.create).toHaveBeenCalledWith({
            name: "Acme Labs",
            slug: "acme",
        });
    });

    it("takes the slug with -s", async () => {
        await runCommand(create, { rawArgs: ["Acme Labs", "-s", "acme"] });

        expect(client.organizations.create).toHaveBeenCalledWith({
            name: "Acme Labs",
            slug: "acme",
        });
    });

    it("prints JSON with --json", async () => {
        await runCommand(create, { rawArgs: ["Acme Labs", "--json"] });

        expect(JSON.parse(stdout())).toEqual(
            JSON.parse(JSON.stringify(organization)),
        );
    });
});
