import { stripVTControlCharacters } from "node:util";
import { runCommand } from "citty";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { client } from "../../client";
import list from "./list";

vi.mock("../../client", () => ({
    client: { organizations: { list: vi.fn() } },
}));

const organizations = [
    {
        id: "org-1",
        name: "Acme",
        slug: "acme",
        logo: null,
        createdAt: new Date("2026-01-02T10:00:00Z"),
    },
    {
        id: "org-2",
        name: "Globex Corporation",
        slug: "globex",
        logo: null,
        createdAt: new Date("2026-03-04T10:00:00Z"),
    },
];

function stdout() {
    return stripVTControlCharacters(
        vi
            .mocked(console.log)
            .mock.calls.map((args) => args.join(" "))
            .join("\n"),
    );
}

beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("orgs list", () => {
    it("prints a row per organization", async () => {
        vi.mocked(client.organizations.list).mockResolvedValue(organizations);

        await runCommand(list, { rawArgs: [] });

        const lines = stdout().split("\n");
        expect(lines[0]).toMatch(/NAME\s+SLUG\s+CREATED/);
        expect(lines[1]).toMatch(/Acme\s+acme\s+2026-01-02/);
        expect(lines[2]).toMatch(/Globex Corporation\s+globex\s+2026-03-04/);
    });

    it("prints JSON with --json", async () => {
        vi.mocked(client.organizations.list).mockResolvedValue(organizations);

        await runCommand(list, { rawArgs: ["--json"] });

        expect(JSON.parse(stdout())).toEqual(
            JSON.parse(JSON.stringify(organizations)),
        );
    });

    it("prints nothing to stdout when there are no organizations", async () => {
        vi.mocked(client.organizations.list).mockResolvedValue([]);

        await runCommand(list, { rawArgs: [] });

        expect(console.log).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("not a member of any organizations"),
        );
    });
});
