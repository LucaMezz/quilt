import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCreateOrganization, useOrganizations } from "./use-organizations";

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
});
