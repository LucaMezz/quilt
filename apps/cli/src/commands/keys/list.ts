import { defineCommand } from "citty";

import { client } from "../../client";
import { shortId } from "../../lib/key-ref";
import { allPages } from "../../lib/pages";
import { log } from "../../ui/log";
import { formatDate, printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { table } from "../../ui/table";
import { theme } from "../../ui/theme";

type KeyState = {
    enabled: boolean;
    expiresAt?: Date | null;
};

function status(key: KeyState) {
    if (!key.enabled) return "disabled";
    if (key.expiresAt && key.expiresAt <= new Date()) return "expired";
    return "active";
}

function dateOr(date: Date | null | undefined, fallback: string) {
    return date ? formatDate(date) : fallback;
}

export default defineCommand({
    meta: {
        name: "list",
        description: "List your API keys",
    },
    args: {
        json: {
            type: "boolean",
            alias: "j",
            default: false,
            description: "Print the keys as JSON",
        },
    },
    async run({ args }) {
        const keys = await withSpinner(
            "Loading API keys…",
            allPages((cursor) => client.apiKeys.list({ limit: 100, cursor })),
        );

        if (args.json) {
            printJson(keys);
            return;
        }
        if (keys.length === 0) {
            log.info("You have no API keys");
            return;
        }
        console.log(
            table(
                ["NAME", "ID", "STATUS", "EXPIRES", "LAST USED"],
                keys.map((key) => [
                    key.name ?? "",
                    theme.muted(shortId(key.id)),
                    status(key),
                    theme.muted(dateOr(key.expiresAt, "never")),
                    theme.muted(dateOr(key.lastRequest, "never")),
                ]),
            ),
        );
    },
});
