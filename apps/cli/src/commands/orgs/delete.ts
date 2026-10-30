import { defineCommand } from "citty";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { confirmByTyping, confirmed } from "../../ui/prompt";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "delete",
        description: "Delete an organization you own; it must have no apps",
    },
    args: {
        org: {
            type: "positional",
            required: true,
            description: "Slug of the organization",
        },
        yes: {
            type: "boolean",
            default: false,
            description: "Delete without asking for confirmation",
        },
        json: {
            type: "boolean",
            default: false,
            description: "Print the deleted organization as JSON",
        },
    },
    async run({ args }) {
        if (!(await confirmed(args.yes, () => confirmByTyping(args.org)))) {
            process.exitCode = 1;
            return;
        }
        const organization = await withSpinner(
            "Deleting organization…",
            client.organizations.delete({ org: args.org }),
        );

        if (args.json) {
            printJson(organization);
            return;
        }
        log.success(
            `Deleted organization ${theme.heading(organization.name)}`,
            organization.slug,
        );
    },
});
