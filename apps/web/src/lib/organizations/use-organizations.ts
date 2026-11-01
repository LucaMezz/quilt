export type Role = "owner" | "admin" | "member";

type Organization = { id: string; name: string; role: Role };

const mockOrganizations: Organization[] = [
    { id: "org_7Hq2", name: "Acme", role: "owner" },
    { id: "org_K9vD", name: "Side projects", role: "admin" },
    { id: "org_3XmP", name: "Open source", role: "member" },
];

export function useOrganizations() {
    return mockOrganizations;
}
