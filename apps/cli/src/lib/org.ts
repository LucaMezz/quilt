import { log } from "../ui/log";
import { theme } from "../ui/theme";

export const orgArg = {
    type: "string",
    alias: "o",
    description: "Slug of the organization; defaults to QUILT_ORG",
} as const;

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
