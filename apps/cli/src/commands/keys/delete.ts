import { defineCommand } from "citty";

import { client } from "../../client";
import { resolveKey, shortId } from "../../lib/key-ref";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { confirmed, confirmYesNo } from "../../ui/prompt";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "delete",
        description: "Delete an API key so it stops working",
    },
    args: {
        key: {
            type: "positional",
            required: false,
            description:
                "Name or ID of the key, or the start of its ID; omit to choose from a list",
        },
        yes: {
            type: "boolean",
            default: false,
            description: "Delete without asking for confirmation",
        },
        json: {
            type: "boolean",
            default: false,
            description: "Print the deleted key as JSON",
        },
    },
    async run({ args }) {
        const target = await resolveKey(args.key);
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
    },
});
