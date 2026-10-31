import { defineCommand } from "citty";

import { client } from "../../client";
import { formatDate, printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { details } from "../../ui/table";

export default defineCommand({
    meta: {
        name: "get",
        description: "Show an organization you're a member of",
    },
    args: {
        org: {
            type: "positional",
            required: true,
            description: "Slug of the organization",
        },
        json: {
            type: "boolean",
            alias: "j",
            default: false,
            description: "Print the organization as JSON",
        },
    },
    async run({ args }) {
        const organization = await withSpinner(
            "Loading organization…",
            client.organizations.get({ org: args.org }),
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
    },
});
