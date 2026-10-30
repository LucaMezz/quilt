import { defineCommand } from "citty";

import create from "./create";
import destroy from "./destroy";
import list from "./list";

export default defineCommand({
    meta: {
        name: "apps",
        description: "Manage the apps in an organization",
    },
    subCommands: {
        list,
        create,
        destroy,
    },
});
