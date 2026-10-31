import { defineCommand } from "citty";

import { client } from "../../client";
import { slugify } from "../../lib/slug";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "create",
        description: "Create an organization with you as its owner",
    },
    args: {
        name: {
            type: "positional",
            required: true,
            description: "Display name of the organization",
        },
        slug: {
            type: "string",
            alias: "s",
            description:
                "Identifier used in URLs and commands; derived from the name if omitted",
        },
        json: {
            type: "boolean",
            alias: "j",
            default: false,
            description: "Print the new organization as JSON",
        },
    },
    async run({ args }) {
        const organization = await withSpinner(
            "Creating organization…",
            client.organizations.create({
                name: args.name,
                slug: args.slug ?? slugify(args.name),
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
    },
});
