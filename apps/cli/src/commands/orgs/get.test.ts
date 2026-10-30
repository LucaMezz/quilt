import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stdout } from "../../testing/output";
import get from "./get";

vi.mock("../../client", () => ({
    client: { organizations: { get: vi.fn() } },
}));

const organization = {
    id: "org-1",
    name: "Acme",
    slug: "acme",
    logo: null,
    createdAt: new Date("2026-01-02T10:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.organizations.get).mockResolvedValue(organization);
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("orgs get", () => {
    it("shows the organization", async () => {
        await runCommand(get, { rawArgs: ["acme"] });

        expect(client.organizations.get).toHaveBeenCalledWith({ org: "acme" });
        expect(stdout()).toMatch(/Name\s+Acme/);
        expect(stdout()).toMatch(/Slug\s+acme/);
        expect(stdout()).toMatch(/ID\s+org-1/);
        expect(stdout()).toMatch(/Created\s+2026-01-02/);
    });

    it("prints JSON with --json", async () => {
        await runCommand(get, { rawArgs: ["acme", "--json"] });

        expect(JSON.parse(stdout())).toEqual(
            JSON.parse(JSON.stringify(organization)),
        );
    });
});
