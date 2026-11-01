import { stripVTControlCharacters } from "node:util";
import { defineCommand } from "citty";
import { describe, expect, it } from "vitest";

import { describeCommand } from "../command-tree";
import { renderHelp } from "./help";

const root = defineCommand({
    meta: { name: "quilt", version: "1.2.3" },
    subCommands: {
        health: defineCommand({ meta: { name: "health" } }),
        show: defineCommand({
            meta: { name: "show" },
            args: { json: { type: "boolean", description: "Print JSON" } },
        }),
    },
});

async function help(name: string) {
    const info = await describeCommand(root);
    const sub = info.subCommands.find((cmd) => cmd.path.at(-1) === name);
    return stripVTControlCharacters(renderHelp(info, sub ?? info));
}

describe("renderHelp", () => {
    it("shows a command's own options above the global ones", async () => {
        const text = await help("show");

        expect(text).toMatch(/Options\n\s+--json\s+Print JSON\n/);
        expect(text).toMatch(
            /Global options\n\s+-k, --api-key <key>\s.*\n\s+-h, --help\s+Show help\n/,
        );
    });

    it("leaves out the options section when a command has none", async () => {
        const text = await help("health");

        expect(text).not.toMatch(/^\s+Options$/m);
        expect(text).toContain("Global options");
    });
});
