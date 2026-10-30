import { defineCommand } from "citty";

import create from "./create";
import list from "./list";

export default defineCommand({
    meta: {
        name: "keys",
        description: "Manage your API keys",
    },
    subCommands: {
        list,
        create,
    },
});
