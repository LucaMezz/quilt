import { defineCommand } from "citty";

import pkg from "../package.json" with { type: "json" };
import health from "./commands/health";
import login from "./commands/login";
import logout from "./commands/logout";
import whoami from "./commands/whoami";

/** The root command. Kept free of side effects so the docs generator can import it. */
export const main = defineCommand({
    meta: {
        name: "quilt",
        version: pkg.version,
        description: "Self-hosted PaaS that stitches your servers together",
    },
    subCommands: {
        health,
        login,
        logout,
        whoami,
    },
});
