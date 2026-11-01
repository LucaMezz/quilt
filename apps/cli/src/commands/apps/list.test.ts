import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "../../client";
import { runCommand } from "../../testing/command";
import { captureOutput, stderr, stdout } from "../../testing/output";
import list from "./list";

vi.mock("../../client", () => ({
    client: { apps: { list: vi.fn() } },
}));

function app(overrides: object) {
    return {
        id: "app-1",
        name: "blog",
        hostname: "blog.quilt.test",
        logo: null,
        status: "running" as const,
        liveDeploymentId: null,
        createdAt: new Date("2026-01-02T10:00:00Z"),
        updatedAt: new Date("2026-01-02T10:00:00Z"),
        ...overrides,
    };
}

beforeEach(() => {
    captureOutput();
});

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    process.exitCode = undefined;
});

describe("apps list", () => {
    it("prints a row per app in the organization", async () => {
        vi.mocked(client.apps.list).mockResolvedValue({
            items: [
                app({}),
                app({
                    id: "app-2",
                    name: "shop",
                    status: "sleeping",
                    hostname: "shop.quilt.test",
                }),
            ],
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: ["--org", "acme"] });

        expect(client.apps.list).toHaveBeenCalledWith({
            org: "acme",
            limit: 100,
            cursor: undefined,
        });
        const lines = stdout().split("\n");
        expect(lines[0]).toMatch(/NAME\s+STATUS\s+HOSTNAME\s+CREATED/);
        expect(lines[1]).toMatch(
            /blog\s+running\s+blog\.quilt\.test\s+2026-01-02/,
        );
        expect(lines[2]).toMatch(/shop\s+sleeping\s+shop\.quilt\.test/);
    });

    it("uses QUILT_ORG when --org isn't given", async () => {
        vi.stubEnv("QUILT_ORG", "acme");
        vi.mocked(client.apps.list).mockResolvedValue({
            items: [],
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: [] });

        expect(client.apps.list).toHaveBeenCalledWith(
            expect.objectContaining({ org: "acme" }),
        );
    });

    it("needs an organization", async () => {
        vi.stubEnv("QUILT_ORG", "");

        await runCommand(list, { rawArgs: [] });

        expect(client.apps.list).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("fetches every page", async () => {
        vi.mocked(client.apps.list)
            .mockResolvedValueOnce({ items: [app({})], nextCursor: "next" })
            .mockResolvedValueOnce({
                items: [app({ id: "app-2", name: "shop" })],
                nextCursor: null,
            });

        await runCommand(list, { rawArgs: ["-o", "acme"] });

        expect(client.apps.list).toHaveBeenLastCalledWith({
            org: "acme",
            limit: 100,
            cursor: "next",
        });
        expect(stdout()).toContain("shop");
    });

    it("prints JSON with --json", async () => {
        const items = [app({})];
        vi.mocked(client.apps.list).mockResolvedValue({
            items,
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: ["--org", "acme", "--json"] });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(items)));
    });

    it("says so when the organization has no apps", async () => {
        vi.mocked(client.apps.list).mockResolvedValue({
            items: [],
            nextCursor: null,
        });

        await runCommand(list, { rawArgs: ["--org", "acme"] });

        expect(console.log).not.toHaveBeenCalled();
        expect(stderr()).toContain("acme has no apps");
    });
});
