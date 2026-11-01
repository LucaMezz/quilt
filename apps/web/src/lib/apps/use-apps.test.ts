import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    APPS_DOMAIN,
    useAppNameTaken,
    useApps,
    useCreateApp,
} from "./use-apps";

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

    it("knows names taken in any organization", () => {
        const { result } = renderHook(() => useAppNameTaken());

        expect(result.current("blog")).toBe(true);
        expect(result.current("shop")).toBe(false);
    });

    it("creates an app that hasn't been deployed yet", () => {
        const { result } = renderHook(() => ({
            create: useCreateApp(),
            apps: useApps("open-source"),
        }));

        act(() => {
            result.current.create({
                organization: "open-source",
                name: "shop",
            });
        });

        expect(result.current.apps).toMatchObject([
            {
                name: "shop",
                hostname: `shop.${APPS_DOMAIN}`,
                status: "pending",
                liveDeployment: null,
            },
        ]);
    });
});
