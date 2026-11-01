import {
    type CommandUnknownOpts,
    InvalidArgumentError,
    Option,
} from "@commander-js/extra-typings";

import { describeCommand, pathOf, rootOf } from "./command-tree";
import { setApiKeyFlag } from "./lib/credentials";
import { renderHelp } from "./ui/help";
import { log } from "./ui/log";
import { theme } from "./ui/theme";

export function configureProgram<T extends CommandUnknownOpts>(root: T): T {
    root.addOption(
        new Option(
            "-k, --api-key <key>",
            "API key to use instead of QUILT_TOKEN or the one saved by quilt login",
        ).argParser(apiKey),
    );
    root.hook("preAction", (_, action) => {
        const { apiKey } = action.optsWithGlobals();
        setApiKeyFlag(typeof apiKey === "string" ? apiKey : undefined);
    });
    configure(root);
    return root;
}

function configure(cmd: CommandUnknownOpts) {
    const help = theme.brand([...pathOf(cmd), "--help"].join(" "));
    cmd.helpOption("-h, --help", "Show help")
        .helpCommand(false)
        .exitOverride()
        .configureHelp({
            formatHelp: (target) =>
                renderHelp(
                    describeCommand(rootOf(target)),
                    describeCommand(target),
                ),
        })
        .configureOutput({
            writeOut: print,
            writeErr: print,
            outputError(message) {
                const [first = "", ...rest] = message
                    .trim()
                    .replace(/^error: /, "")
                    .split("\n");
                log.error(first.charAt(0).toUpperCase() + first.slice(1));
                for (const line of rest) {
                    log.hint(line.replace(/^\((.*)\)$/, "$1"));
                }
                log.hint(`Run ${help} to see usage.`);
            },
        });
    for (const sub of cmd.commands) configure(sub);
}

function print(text: string) {
    console.log(text.replace(/\n$/, ""));
}

function apiKey(value: string) {
    if (!value || value.startsWith("-")) {
        throw new InvalidArgumentError("Pass the key right after --api-key.");
    }
    return value;
}
