import { defineCommand } from "citty";

import { client } from "../../client";
import { orgArg, selectedOrg } from "../../lib/org";
import { allPages } from "../../lib/pages";
import { log } from "../../ui/log";
import { formatDate, printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { table } from "../../ui/table";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "list",
        description: "List an organization's apps",
    },
    args: {
        org: orgArg,
        json: {
            type: "boolean",
            default: false,
            description: "Print the apps as JSON",
        },
    },
    async run({ args }) {
        const org = selectedOrg(args.org);
        if (!org) {
            process.exitCode = 1;
            return;
        }
        const apps = await withSpinner(
            "Loading apps…",
            allPages((cursor) => client.apps.list({ org, limit: 100, cursor })),
        );

        if (args.json) {
            printJson(apps);
            return;
        }
        if (apps.length === 0) {
            log.info(`${theme.heading(org)} has no apps`);
            return;
        }
        console.log(
            table(
                ["NAME", "STATUS", "HOSTNAME", "CREATED"],
                apps.map((app) => [
                    app.name,
                    app.status,
                    theme.muted(app.hostname),
                    theme.muted(formatDate(app.createdAt)),
                ]),
            ),
        );
    },
});
