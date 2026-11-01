import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default new Command("update")
    .description("Rename an organization or change its slug")
    .argument("<org>", "Slug of the organization")
    .option("-n, --name <name>", "New display name")
    .option(
        "-s, --slug <slug>",
        "New slug; scripts and links using the old one stop working",
    )
    .option("-j, --json", "Print the updated organization as JSON")
    .action(async (org, args) => {
        if (args.name === undefined && args.slug === undefined) {
            log.error("Nothing to update");
            log.hint(`Pass ${theme.brand("--name or --slug")}.`);
            process.exitCode = 1;
            return;
        }
        const organization = await withSpinner(
            "Updating organization…",
            client.organizations.update({
                org,
                name: args.name,
                slug: args.slug,
            }),
        );

        if (args.json) {
            printJson(organization);
            return;
        }
        log.success(
            `Updated organization ${theme.heading(organization.name)}`,
            organization.slug,
        );
    });
