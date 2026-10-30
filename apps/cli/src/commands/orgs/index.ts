import { defineCommand } from "citty";

import create from "./create";
import get from "./get";
import list from "./list";

export default defineCommand({
    meta: {
        name: "orgs",
        description: "Manage your organizations",
    },
    subCommands: {
        list,
        get,
        create,
    },
});
