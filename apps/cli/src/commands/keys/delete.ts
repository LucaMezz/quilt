import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { resolveKey, shortId } from "../../lib/key-ref";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { confirmed, confirmYesNo } from "../../ui/prompt";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default new Command("delete")
    .description("Delete an API key so it stops working")
    .argument(
        "[key]",
        "Name or ID of the key, or the start of its ID; omit to choose from a list",
    )
    .option("-y, --yes", "Delete without asking for confirmation")
    .option("-j, --json", "Print the deleted key as JSON")
    .action(async (ref, args) => {
        const target = await resolveKey(ref);
        if (!target) {
            process.exitCode = 1;
            return;
        }
        const ask = () =>
            confirmYesNo(
                `Delete API key ${target.name ?? "(unnamed)"} (${shortId(target.id)})? Anything using it stops working.`,
            );
        if (!(await confirmed(args.yes, ask))) {
            process.exitCode = 1;
            return;
        }
        const key = await withSpinner(
            "Deleting API key…",
            client.apiKeys.delete({ id: target.id }),
        );

        if (args.json) {
            printJson(key);
            return;
        }
        log.success(
            `Deleted API key ${theme.heading(key.name ?? key.id)}`,
            key.id,
        );
    });
