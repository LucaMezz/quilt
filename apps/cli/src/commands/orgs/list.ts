import { defineCommand } from "citty";

import { client } from "../../client";
import { log } from "../../ui/log";
import { formatDate, printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { table } from "../../ui/table";
import { theme } from "../../ui/theme";

export default defineCommand({
    meta: {
        name: "list",
        description: "List the organizations you're a member of",
    },
    args: {
        json: {
            type: "boolean",
            alias: "j",
            default: false,
            description: "Print the organizations as JSON",
        },
    },
    async run({ args }) {
        const organizations = await withSpinner(
            "Loading organizations…",
            client.organizations.list(),
        );

        if (args.json) {
            printJson(organizations);
            return;
        }
        if (organizations.length === 0) {
            log.info("You're not a member of any organizations");
            return;
        }
        console.log(
            table(
                ["NAME", "SLUG", "CREATED"],
                organizations.map((organization) => [
                    organization.name,
                    theme.muted(organization.slug),
                    theme.muted(formatDate(organization.createdAt)),
                ]),
            ),
        );
    },
});
