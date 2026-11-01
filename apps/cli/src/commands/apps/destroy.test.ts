import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "../../client";
import { runCommand } from "../../testing/command";
import { captureOutput, stderr, stdout } from "../../testing/output";
import { confirmByTyping, confirmed } from "../../ui/prompt";
import destroy from "./destroy";

vi.mock("../../client", () => ({
    client: { apps: { destroy: vi.fn() } },
}));
vi.mock("../../ui/prompt");

const app = {
    id: "app-1",
    name: "blog",
    hostname: "blog.quilt.test",
    logo: null,
    status: "destroying" as const,
    liveDeploymentId: null,
    createdAt: new Date("2026-01-02T10:00:00Z"),
    updatedAt: new Date("2026-01-02T10:00:00Z"),
};

beforeEach(() => {
    captureOutput();
    vi.mocked(client.apps.destroy).mockResolvedValue(app);
    vi.mocked(confirmed).mockResolvedValue(true);
});

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    process.exitCode = undefined;
});

describe("apps destroy", () => {
    it("starts destroying the app once confirmed", async () => {
        await runCommand(destroy, { rawArgs: ["blog", "--org", "acme"] });

        expect(client.apps.destroy).toHaveBeenCalledWith({
            org: "acme",
            name: "blog",
        });
        expect(stderr()).toContain("Destroying app blog");
    });

    it("asks you to type the app name", async () => {
        await runCommand(destroy, { rawArgs: ["blog", "--org", "acme"] });

        const [yes, ask] = vi.mocked(confirmed).mock.calls[0] ?? [];
        expect(yes).toBeFalsy();
        await ask?.();
        expect(confirmByTyping).toHaveBeenCalledWith("blog");
    });

    it("skips the question with --yes", async () => {
        await runCommand(destroy, { rawArgs: ["blog", "-o", "acme", "--yes"] });

        expect(confirmed).toHaveBeenCalledWith(true, expect.any(Function));
    });

    it("needs an organization before asking", async () => {
        vi.stubEnv("QUILT_ORG", "");

        await runCommand(destroy, { rawArgs: ["blog"] });

        expect(confirmed).not.toHaveBeenCalled();
        expect(client.apps.destroy).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("destroys nothing when not confirmed", async () => {
        vi.mocked(confirmed).mockResolvedValue(false);

        await runCommand(destroy, { rawArgs: ["blog", "--org", "acme"] });

        expect(client.apps.destroy).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it("prints JSON with --json", async () => {
        await runCommand(destroy, {
            rawArgs: ["blog", "-o", "acme", "--yes", "--json"],
        });

        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(app)));
    });

    it("combines short flags", async () => {
        await runCommand(destroy, { rawArgs: ["blog", "-o", "acme", "-yj"] });

        expect(confirmed).toHaveBeenCalledWith(true, expect.any(Function));
        expect(JSON.parse(stdout())).toEqual(JSON.parse(JSON.stringify(app)));
    });
});
