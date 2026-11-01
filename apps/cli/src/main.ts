import { Command } from "@commander-js/extra-typings";

import pkg from "../package.json" with { type: "json" };
import apps from "./commands/apps";
import health from "./commands/health";
import keys from "./commands/keys";
import login from "./commands/login";
import logout from "./commands/logout";
import orgs from "./commands/orgs";
import whoami from "./commands/whoami";
import { configureProgram } from "./program";

/** The root command. Kept free of side effects so the docs generator can import it. */
export const main = configureProgram(
    new Command("quilt")
        .description("Self-hosted PaaS that stitches your servers together")
        .version(pkg.version, "-v, --version", "Show version")
        .addCommand(apps)
        .addCommand(health)
        .addCommand(keys)
        .addCommand(login)
        .addCommand(logout)
        .addCommand(orgs)
        .addCommand(whoami),
);
