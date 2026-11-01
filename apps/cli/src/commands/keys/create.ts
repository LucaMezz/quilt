import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

const SECONDS_PER_DAY = 24 * 60 * 60;

export default new Command("create")
    .description("Create an API key; it's printed once to stdout")
    .argument("<name>", "Name to recognise the key by")
    .option(
        "-e, --expires-in <days>",
        "Days until the key expires, from 1 to 365",
        "90",
    )
    .option("-j, --json", "Print the new key and its details as JSON")
    .action(async (name, args) => {
        const days = Number(args.expiresIn);
        if (!Number.isInteger(days)) {
            log.error("--expires-in must be a whole number of days");
            process.exitCode = 1;
            return;
        }
        const created = await withSpinner(
            "Creating API key…",
            client.apiKeys.create({
                name,
                expiresIn: days * SECONDS_PER_DAY,
            }),
        );

        if (args.json) {
            printJson(created);
            return;
        }
        log.success(`Created API key ${theme.heading(name)}`, created.id);
        log.warn("Copy it now: it won't be shown again");
        console.log(created.key);
    });
