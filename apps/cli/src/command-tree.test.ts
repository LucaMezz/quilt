import { Command } from "@commander-js/extra-typings";
import { describe, expect, it } from "vitest";

import { describeCommand } from "./command-tree";
import { configureProgram } from "./program";

const root = configureProgram(
    new Command("quilt")
        .version("1.2.3", "-v, --version", "Show version")
        .addCommand(
            new Command("show")
                .argument("<app>")
                .argument("[env]")
                .option("-j, --json", "Print JSON")
                .option("-e, --expires-in <days>", "Days", "90"),
        ),
);

const flags = (args: { flag: string }[]) => args.map((arg) => arg.flag);

describe("describeCommand", () => {
    it("lists global options apart from a command's own options", () => {
        const [show] = describeCommand(root).subCommands;

        expect(flags(show?.options ?? [])).toEqual([
            "-j, --json",
            "-e, --expires-in <days>",
        ]);
        expect(flags(show?.globalOptions ?? [])).toEqual([
            "-k, --api-key <key>",
            "-h, --help",
        ]);
    });

    it("keeps --version an option of the root command only", () => {
        const info = describeCommand(root);

        expect(info.version).toBe("1.2.3");
        expect(flags(info.options)).toEqual(["-v, --version"]);
        expect(flags(info.globalOptions)).not.toContain("-v, --version");
        expect(info.subCommands[0]?.version).toBeUndefined();
    });

    it("marks optional arguments and records defaults", () => {
        const [show] = describeCommand(root).subCommands;

        expect(show?.path).toEqual(["quilt", "show"]);
        expect(flags(show?.positionals ?? [])).toEqual(["<app>", "[env]"]);
        expect(show?.options[1]?.default).toBe("90");
    });
});
