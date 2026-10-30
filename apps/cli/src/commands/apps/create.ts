import { defineCommand } from "citty";

import { client } from "../../client";
import { orgArg, selectedOrg } from "../../lib/org";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "create",
        description: "Create an app in an organization",
    },
    args: {
        name: {
            type: "positional",
            required: true,
            description:
                "Name of the app, unique across all organizations; can't be changed later",
        },
        org: orgArg,
        json: {
            type: "boolean",
            default: false,
            description: "Print the new app as JSON",
        },
    },
    async run({ args }) {
        const org = selectedOrg(args.org);
        if (!org) {
            process.exitCode = 1;
            return;
        }
        const app = await withSpinner(
            "Creating app…",
            client.apps.create({ org, name: args.name }),
        );

        if (args.json) {
            printJson(app);
            return;
        }
        log.success(`Created app ${theme.heading(app.name)}`, app.hostname);
    },
});
