import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { orgOption, selectedOrg } from "../../lib/org";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { confirmByTyping, confirmed } from "../../ui/prompt";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default new Command("destroy")
    .description("Destroy an app and tear down everything it runs")
    .argument("<name>", "Name of the app")
    .addOption(orgOption())
    .option("-y, --yes", "Destroy without asking for confirmation")
    .option("-j, --json", "Print the app as JSON")
    .action(async (name, args) => {
        const org = selectedOrg(args.org);
        if (!org || !(await confirmed(args.yes, () => confirmByTyping(name)))) {
            process.exitCode = 1;
            return;
        }
        const app = await withSpinner(
            "Destroying app…",
            client.apps.destroy({ org, name }),
        );

        if (args.json) {
            printJson(app);
            return;
        }
        log.success(
            `Destroying app ${theme.heading(app.name)}`,
            "its workloads are being torn down",
        );
    });
