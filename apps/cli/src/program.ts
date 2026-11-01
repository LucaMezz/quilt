import {
    type CommandUnknownOpts,
    InvalidArgumentError,
    Option,
} from "@commander-js/extra-typings";
import { serverHost, serverUrl } from "./client";
import { describeCommand, pathOf, rootOf } from "./command-tree";
import { getCredential, setApiKeyFlag } from "./lib/credentials";
import { renderHelp } from "./ui/help";
import { isDebugging, log, setDebugFlag } from "./ui/log";
import { theme } from "./ui/theme";

export function configureProgram<T extends CommandUnknownOpts>(root: T): T {
    root.addOption(
        new Option(
            "-k, --api-key <key>",
            "API key to use instead of QUILT_API_KEY or the one saved by quilt login",
        ).argParser(apiKey),
    );
    root.option(
        "--debug",
        "Print each API request and full errors to stderr; same as QUILT_DEBUG=1",
    );
    root.hook("preAction", (_, action) => {
        const { apiKey, debug } = action.optsWithGlobals();
        setApiKeyFlag(typeof apiKey === "string" ? apiKey : undefined);
        setDebugFlag(debug === true);
        if (isDebugging()) {
            log.debug(`server ${serverUrl}`);
            log.debug(`api key ${getCredential(serverHost)?.source ?? "none"}`);
        }
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
