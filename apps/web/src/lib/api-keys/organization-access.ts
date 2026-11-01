import type { OrganizationAccess } from "./use-api-keys";

export type OrganizationChoice = { mode: "all" | "selected"; ids: string[] };

export function choiceFor(access: OrganizationAccess): OrganizationChoice {
    return access === "all"
        ? { mode: "all", ids: [] }
        : { mode: "selected", ids: [...access] };
}

export function accessFor(choice: OrganizationChoice): OrganizationAccess {
    return choice.mode === "all" ? "all" : [...choice.ids];
}

export function missingOrganizations(choice: OrganizationChoice) {
    return choice.mode === "selected" && choice.ids.length === 0;
}

export function sameOrganizationAccess(
    a: OrganizationAccess,
    b: OrganizationAccess,
) {
    if (a === "all" || b === "all") return a === b;
    return a.length === b.length && a.every((id) => b.includes(id));
}
