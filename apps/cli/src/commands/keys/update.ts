import { defineCommand } from "citty";

import { client } from "../../client";
import { log } from "../../ui/log";
import { printJson } from "../../ui/output";
import { withSpinner } from "../../ui/spinner";
import { theme } from "../../ui/theme";

function enabledFrom(enable: boolean, disable: boolean) {
    if (enable) return true;
    if (disable) return false;
    return undefined;
}

export default defineCommand({
    meta: {
        name: "update",
        description: "Rename, enable or disable an API key",
    },
    args: {
        id: {
            type: "positional",
            required: true,
            description: "ID of the key, from quilt keys list",
        },
        name: {
            type: "string",
            description: "New name",
        },
        enable: {
            type: "boolean",
            default: false,
            description: "Let the key be used again",
        },
        disable: {
            type: "boolean",
            default: false,
            description: "Stop the key from working until it's enabled again",
        },
        json: {
            type: "boolean",
            default: false,
            description: "Print the updated key as JSON",
        },
    },
    async run({ args }) {
        if (args.enable && args.disable) {
            log.error("Pass either --enable or --disable, not both");
            process.exitCode = 1;
            return;
        }
        const enabled = enabledFrom(args.enable, args.disable);
        if (args.name === undefined && enabled === undefined) {
            log.error("Nothing to update");
            log.hint(`Pass ${theme.brand("--name, --enable or --disable")}.`);
            process.exitCode = 1;
            return;
        }
        const key = await withSpinner(
            "Updating API key…",
            client.apiKeys.update({ id: args.id, name: args.name, enabled }),
        );

        if (args.json) {
            printJson(key);
            return;
        }
        log.success(
            `Updated API key ${theme.heading(key.name ?? key.id)}`,
            key.enabled ? "enabled" : "disabled",
        );
    },
});
