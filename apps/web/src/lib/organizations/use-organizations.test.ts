import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useApps } from "@/lib/apps/use-apps";

import {
    canManageOrganization,
    useCreateOrganization,
    useOrganization,
    useOrganizations,
    useUpdateOrganization,
} from "./use-organizations";

describe("organization store", () => {
    it("adds a created organization with you as its owner", () => {
        const { result } = renderHook(() => ({
            organizations: useOrganizations(),
            create: useCreateOrganization(),
        }));
        const before = result.current.organizations.length;

        let created: ReturnType<typeof result.current.create> | undefined;
        act(() => {
            created = result.current.create({ name: "Lab", slug: "lab" });
        });

        expect(result.current.organizations).toHaveLength(before + 1);
        expect(result.current.organizations.at(-1)).toEqual(created);
        expect(created).toMatchObject({
            name: "Lab",
            slug: "lab",
            role: "owner",
        });
    });

    it("renames an organization and keeps its apps when its URL name changes", () => {
        const { result } = renderHook(() => ({
            update: useUpdateOrganization(),
            renamed: useOrganization("acme-inc"),
            apps: useApps("acme-inc"),
        }));

        act(() => {
            result.current.update("org_7Hq2", {
                name: "Acme Inc",
                slug: "acme-inc",
            });
        });

        expect(result.current.renamed).toMatchObject({
            id: "org_7Hq2",
            name: "Acme Inc",
        });
        expect(result.current.apps.map((app) => app.name)).toContain("api");
    });

    it.each([
        ["owner", true],
        ["admin", true],
        ["member", false],
    ] as const)("lets an %s manage the organization: %s", (role, allowed) => {
        const organization = {
            id: "org_1",
            name: "Lab",
            slug: "lab",
            role,
            createdAt: new Date(),
        };

        expect(canManageOrganization(organization)).toBe(allowed);
    });
});
