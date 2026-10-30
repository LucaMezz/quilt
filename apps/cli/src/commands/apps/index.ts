import { defineCommand } from "citty";

import list from "./list";

export default defineCommand({
    meta: {
        name: "apps",
        description: "Manage the apps in an organization",
    },
    subCommands: {
        list,
    },
});
