import { Option } from "@commander-js/extra-typings";

import { log } from "../ui/log";
import { theme } from "../ui/theme";

export const orgOption = () =>
    new Option(
        "-o, --org <slug>",
        "Slug of the organization; defaults to QUILT_ORG",
    );

export function selectedOrg(flag: string | undefined) {
    const org = flag || process.env.QUILT_ORG;
    if (!org) {
        log.error("No organization selected");
        log.hint(
            `Pass ${theme.brand("--org <slug>")} or set QUILT_ORG. Run ${theme.brand("quilt orgs list")} to see yours.`,
        );
    }
    return org || undefined;
}
