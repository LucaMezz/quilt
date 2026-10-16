#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import pkg from "../package.json" with { type: "json" };
import health from "./commands/health";

export const main = defineCommand({
    meta: {
        name: "quilt",
        version: pkg.version,
        description: "Command-line interface for quilt",
    },
    subCommands: {
        health,
    },
});

runMain(main);
