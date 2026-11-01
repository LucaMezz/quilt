import { stripVTControlCharacters } from "node:util";
import { Command } from "@commander-js/extra-typings";
import { describe, expect, it } from "vitest";

import { describeCommand } from "../command-tree";
import { configureProgram } from "../program";
import { renderHelp } from "./help";

const root = configureProgram(
    new Command("quilt")
        .version("1.2.3", "-v, --version", "Show version")
        .addCommand(new Command("health"))
        .addCommand(new Command("show").option("--json", "Print JSON")),
);

function help(name: string) {
    const info = describeCommand(root);
    const sub = info.subCommands.find((cmd) => cmd.path.at(-1) === name);
    return stripVTControlCharacters(renderHelp(info, sub ?? info));
}

describe("renderHelp", () => {
    it("shows a command's own options above the global ones", () => {
        const text = help("show");

        expect(text).toMatch(/Options\n\s+--json\s+Print JSON\n/);
        expect(text).toMatch(
            /Global options\n\s+-k, --api-key <key>\s.*\n\s+-h, --help\s+Show help\n/,
        );
    });

    it("leaves out the options section when a command has none", () => {
        const text = help("health");

        expect(text).not.toMatch(/^\s+Options$/m);
        expect(text).toContain("Global options");
    });
});
