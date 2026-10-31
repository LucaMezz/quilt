import { defineCommand } from "citty";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

const SECONDS_PER_DAY = 24 * 60 * 60;

export default defineCommand({
    meta: {
        name: "create",
        description: "Create an API key; it's printed once to stdout",
    },
    args: {
        name: {
            type: "positional",
            required: true,
            description: "Name to recognise the key by",
        },
        "expires-in": {
            type: "string",
            alias: "e",
            default: "90",
            description: "Days until the key expires, from 1 to 365",
        },
        json: {
            type: "boolean",
            alias: "j",
            default: false,
            description: "Print the new key and its details as JSON",
        },
    },
    async run({ args }) {
        const days = Number(args["expires-in"]);
        if (!Number.isInteger(days)) {
            log.error("--expires-in must be a whole number of days");
            process.exitCode = 1;
            return;
        }
        const created = await withSpinner(
            "Creating API key…",
            client.apiKeys.create({
                name: args.name,
                expiresIn: days * SECONDS_PER_DAY,
            }),
        );

        if (args.json) {
            printJson(created);
            return;
        }
        log.success(`Created API key ${theme.heading(args.name)}`, created.id);
        log.warn("Copy it now: it won't be shown again");
        console.log(created.key);
    },
});
