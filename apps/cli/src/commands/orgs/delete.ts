import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { confirmByTyping, confirmed } from "../../ui/prompt";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default new Command("delete")
    .description("Delete an organization you own; it must have no apps")
    .argument("<org>", "Slug of the organization")
    .option("-y, --yes", "Delete without asking for confirmation")
    .option("-j, --json", "Print the deleted organization as JSON")
    .action(async (org, args) => {
        if (!(await confirmed(args.yes, () => confirmByTyping(org)))) {
            process.exitCode = 1;
            return;
        }
        const organization = await withSpinner(
            "Deleting organization…",
            client.organizations.delete({ org }),
        );

        if (args.json) {
            printJson(organization);
            return;
        }
        log.success(
            `Deleted organization ${theme.heading(organization.name)}`,
            organization.slug,
        );
    });
