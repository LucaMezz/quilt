import { defineCommand } from "citty";

import { client } from "../../client";
import { log } from "../../ui/log";
import { spinner } from "../../ui/spinner";
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
            default: false,
            description: "Print the organizations as JSON",
        },
    },
    async run({ args }) {
        const progress = spinner("Loading organizations…");
        const organizations = await client.organizations
            .list()
            .finally(() => progress.stop());

        if (args.json) {
            console.log(JSON.stringify(organizations, null, 2));
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
                    theme.muted(
                        organization.createdAt.toISOString().slice(0, 10),
                    ),
                ]),
            ),
        );
    },
});
