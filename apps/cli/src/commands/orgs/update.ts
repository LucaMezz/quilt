import { defineCommand } from "citty";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "update",
        description: "Rename an organization or change its slug",
    },
    args: {
        org: {
            type: "positional",
            required: true,
            description: "Slug of the organization",
        },
        name: {
            type: "string",
            description: "New display name",
        },
        slug: {
            type: "string",
            description:
                "New slug; scripts and links using the old one stop working",
        },
        json: {
            type: "boolean",
            default: false,
            description: "Print the updated organization as JSON",
        },
    },
    async run({ args }) {
        if (args.name === undefined && args.slug === undefined) {
            log.error("Nothing to update");
            log.hint(`Pass ${theme.brand("--name or --slug")}.`);
            process.exitCode = 1;
            return;
        }
        const organization = await withSpinner(
            "Updating organization…",
            client.organizations.update({
                org: args.org,
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
    },
});
