import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { slugify } from "../../lib/slug";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default new Command("create")
    .description("Create an organization with you as its owner")
    .argument("<name>", "Display name of the organization")
    .option(
        "-s, --slug <slug>",
        "Identifier used in URLs and commands; derived from the name if omitted",
    )
    .option("-j, --json", "Print the new organization as JSON")
    .action(async (name, args) => {
        const organization = await withSpinner(
            "Creating organization…",
            client.organizations.create({
                name,
                slug: args.slug ?? slugify(name),
            }),
        );

        if (args.json) {
            printJson(organization);
            return;
        }
        log.success(
            `Created organization ${theme.heading(organization.name)}`,
            organization.slug,
        );
    });
