import { Command } from "@commander-js/extra-typings";

import create from "./create";
import remove from "./delete";
import list from "./list";
import update from "./update";

export default new Command("keys")
    .description("Manage your API keys")
    .addCommand(list)
    .addCommand(create)
    .addCommand(update)
    .addCommand(remove);
