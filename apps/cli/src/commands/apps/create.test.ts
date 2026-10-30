import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import { captureOutput, stderr, stdout } from "../../testing/output";
import create from "./create";

vi.mock("../../client", () => ({
    client: { apps: { create: vi.fn() } },
}));

const app = {
    id: "app-1",
    name: "blog",
    hostname: "blog.quilt.test",
    logo: null,
    status: "pending" as const,
    liveDeploymentId: null,
    createdAt: new Date("2026-01-02T10:00:00Z"),
    updatedAt: new Date("2026-01-02T10:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.apps.create).mockResolvedValue(app);
});

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    process.exitCode = undefined;
});

describe("apps create", () => {
    it("creates the app in the organization", async () => {
        await runCommand(create, { rawArgs: ["blog", "--org", "acme"] });

        expect(client.apps.create).toHaveBeenCalledWith({
            org: "acme",
            name: "blog",
        });
        expect(stderr()).toContain("Created app blog");
        expect(stderr()).toContain("blog.quilt.test");
        expect(console.log).not.toHaveBeenCalled();
    });

    it("needs an organization", async () => {
        vi.stubEnv("QUILT_ORG", "");

        await runCommand(create, { rawArgs: ["blog"] });

        expect(client.apps.create).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(create, { rawArgs: ["blog", "-o", "acme", "--json"] });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(app)));
    });
});
