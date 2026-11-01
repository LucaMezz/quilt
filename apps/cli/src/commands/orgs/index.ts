import { Command } from "@commander-js/extra-typings";

import create from "./create";
import remove from "./delete";
import get from "./get";
import list from "./list";
import update from "./update";

export default new Command("orgs")
    .description("Manage your organizations")
    .addCommand(list)
    .addCommand(get)
    .addCommand(create)
    .addCommand(update)
    .addCommand(remove);
