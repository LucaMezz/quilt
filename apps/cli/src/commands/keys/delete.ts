import { defineCommand } from "citty";

import { client } from "../../client";
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
        id: {
            type: "positional",
            required: true,
            description: "ID of the key, from quilt keys list",
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
        const ask = () =>
            confirmYesNo(
                `Delete API key ${args.id}? Anything using it stops working.`,
            );
        if (!(await confirmed(args.yes, ask))) {
            process.exitCode = 1;
            return;
        }
        const key = await withSpinner(
            "Deleting API key…",
            client.apiKeys.delete({ id: args.id }),
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
