import { Command } from "@commander-js/extra-typings";

import { client } from "../../client";
import { formatDate, printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { details } from "../../ui/table";

export default new Command("get")
    .description("Show an organization you're a member of")
    .argument("<org>", "Slug of the organization")
    .option("-j, --json", "Print the organization as JSON")
    .action(async (org, args) => {
        const organization = await withSpinner(
            "Loading organization…",
            client.organizations.get({ org }),
        );

        if (args.json) {
            printJson(organization);
            return;
        }
        console.log(
            details([
                ["Name", organization.name],
                ["Slug", organization.slug],
                ["ID", organization.id],
                ["Created", formatDate(organization.createdAt)],
            ]),
        );
    });
