import { defineCommand } from "citty";

import list from "./list";

export default defineCommand({
    meta: {
        name: "orgs",
        description: "Manage your organizations",
    },
    subCommands: {
        list,
    },
});
