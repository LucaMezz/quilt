import { defineCommand } from "citty";

import { client } from "../../client";
import { orgArg, selectedOrg } from "../../lib/org";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { confirmByTyping, confirmed } from "../../ui/prompt";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "destroy",
        description: "Destroy an app and tear down everything it runs",
    },
    args: {
        name: {
            type: "positional",
            required: true,
            description: "Name of the app",
        },
        org: orgArg,
        yes: {
            type: "boolean",
            alias: "y",
            default: false,
            description: "Destroy without asking for confirmation",
        },
        json: {
            type: "boolean",
            alias: "j",
            default: false,
            description: "Print the app as JSON",
        },
    },
    async run({ args }) {
        const org = selectedOrg(args.org);
        if (
            !org ||
            !(await confirmed(args.yes, () => confirmByTyping(args.name)))
        ) {
            process.exitCode = 1;
            return;
        }
        const app = await withSpinner(
            "Destroying app…",
            client.apps.destroy({ org, name: args.name }),
        );

        if (args.json) {
            printJson(app);
            return;
        }
        log.success(
            `Destroying app ${theme.heading(app.name)}`,
            "its workloads are being torn down",
        );
    },
});
