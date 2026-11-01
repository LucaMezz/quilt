import { Command } from "@commander-js/extra-typings";

import create from "./create";
import destroy from "./destroy";
import list from "./list";

export default new Command("apps")
    .description("Manage the apps in an organization")
    .addCommand(list)
    .addCommand(create)
    .addCommand(destroy);
