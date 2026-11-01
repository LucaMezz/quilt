import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { resolveKey } from "../../lib/key-ref";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

function enabledFrom(enable?: boolean, disable?: boolean) {
    if (enable) return true;
    if (disable) return false;
    return undefined;
}

export default new Command("update")
    .description("Rename, enable or disable an API key")
    .argument(
        "[key]",
        "Name or ID of the key, or the start of its ID; omit to choose from a list",
    )
    .option("-n, --name <name>", "New name")
    .option("--enable", "Let the key be used again")
    .option("--disable", "Stop the key from working until it's enabled again")
    .option("-j, --json", "Print the updated key as JSON")
    .action(async (ref, args) => {
        if (args.enable && args.disable) {
            log.error("Pass either --enable or --disable, not both");
            process.exitCode = 1;
            return;
        }
        const enabled = enabledFrom(args.enable, args.disable);
        if (args.name === undefined && enabled === undefined) {
            log.error("Nothing to update");
            log.hint(`Pass ${theme.brand("--name, --enable or --disable")}.`);
            process.exitCode = 1;
            return;
        }
        const target = await resolveKey(ref);
        if (!target) {
            process.exitCode = 1;
            return;
        }
        const key = await withSpinner(
            "Updating API key…",
            client.apiKeys.update({ id: target.id, name: args.name, enabled }),
        );

        if (args.json) {
            printJson(key);
            return;
        }
        log.success(
            `Updated API key ${theme.heading(key.name ?? key.id)}`,
            key.enabled ? "enabled" : "disabled",
        );
    });
