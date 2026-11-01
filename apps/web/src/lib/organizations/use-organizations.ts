type Organization = { id: string; name: string };

const mockOrganizations: Organization[] = [
    { id: "org_7Hq2", name: "Acme" },
    { id: "org_K9vD", name: "Side projects" },
    { id: "org_3XmP", name: "Open source" },
];

export function useOrganizations() {
    return mockOrganizations;
}
