import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { APPS_DOMAIN, useApps } from "./use-apps";

describe("app store", () => {
    it("lists only the organization's apps", () => {
        const { result } = renderHook(() => useApps("side-projects"));

        expect(result.current.map((app) => app.name)).toEqual(["blog"]);
    });

    it("serves each app at its name under the apps domain", () => {
        const { result } = renderHook(() => useApps("acme"));

        for (const app of result.current) {
            expect(app.hostname).toBe(`${app.name}.${APPS_DOMAIN}`);
        }
    });

    it("has no apps for an organization without any", () => {
        const { result } = renderHook(() => useApps("open-source"));

        expect(result.current).toEqual([]);
    });
});
