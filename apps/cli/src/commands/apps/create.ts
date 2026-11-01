import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { orgOption, selectedOrg } from "../../lib/org";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default new Command("create")
    .description("Create an app in an organization")
    .argument(
        "<name>",
        "Name of the app, unique across all organizations; can't be changed later",
    )
    .addOption(orgOption())
    .option("-j, --json", "Print the new app as JSON")
    .action(async (name, args) => {
        const org = selectedOrg(args.org);
        if (!org) {
            process.exitCode = 1;
            return;
        }
        const app = await withSpinner(
            "Creating app…",
            client.apps.create({ org, name }),
        );

        if (args.json) {
            printJson(app);
            return;
        }
        log.success(`Created app ${theme.heading(app.name)}`, app.hostname);
    });
