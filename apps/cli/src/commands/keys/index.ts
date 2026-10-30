import { defineCommand } from "citty";

import create from "./create";
import remove from "./delete";
import list from "./list";
import update from "./update";

export default defineCommand({
    meta: {
        name: "keys",
        description: "Manage your API keys",
    },
    subCommands: {
        list,
        create,
        update,
        delete: remove,
    },
});
