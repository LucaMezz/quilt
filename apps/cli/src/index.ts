#!/usr/bin/env node
import { defineCommand } from "citty";

import pkg from "../package.json" with { type: "json" };
import health from "./commands/health";
import { run } from "./run";

export const main = defineCommand({
    meta: {
        name: "quilt",
        version: pkg.version,
        description: "Self-hosted PaaS that stitches your servers together",
    },
    subCommands: {
        health,
    },
});

// Not awaited: Bun's --bytecode compile doesn't allow top-level await.
// run() handles its own errors.
void run(main);
