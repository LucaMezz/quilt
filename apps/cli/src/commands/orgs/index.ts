import { defineCommand } from "citty";

import create from "./create";
import remove from "./delete";
import get from "./get";
import list from "./list";
import update from "./update";

export default defineCommand({
    meta: {
        name: "orgs",
        description: "Manage your organizations",
    },
    subCommands: {
        list,
        get,
        create,
        update,
        delete: remove,
    },
});
