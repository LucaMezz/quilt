import { defineCommand } from "citty";
import { describe, expect, it } from "vitest";

import { describeCommand } from "./command-tree";

const root = defineCommand({
    meta: { name: "quilt", version: "1.2.3" },
    subCommands: {
        show: defineCommand({
            meta: { name: "show" },
            args: {
                app: { type: "positional", required: true },
                json: {
                    type: "boolean",
                    alias: "j",
                    description: "Print JSON",
                },
            },
        }),
    },
});

const flags = (args: { flag: string }[]) => args.map((arg) => arg.flag);

describe("describeCommand", () => {
    it("lists global options apart from a command's own options", async () => {
        const [show] = (await describeCommand(root)).subCommands;

        expect(flags(show?.options ?? [])).toEqual(["-j, --json"]);
        expect(flags(show?.globalOptions ?? [])).toEqual([
            "-k, --api-key <key>",
            "-h, --help",
        ]);
    });

    it("keeps --version an option of the root command only", async () => {
        const info = await describeCommand(root);

        expect(flags(info.options)).toEqual(["-v, --version"]);
        expect(flags(info.globalOptions)).not.toContain("-v, --version");
        expect(flags(info.subCommands[0]?.options ?? [])).not.toContain(
            "-v, --version",
        );
    });
});
