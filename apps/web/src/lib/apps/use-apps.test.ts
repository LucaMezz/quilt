import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    APPS_DOMAIN,
    TEARDOWN_MS,
    useApp,
    useAppNameTaken,
    useApps,
    useCreateApp,
    useDestroyApp,
} from "./use-apps";

describe("app store", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

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

    it("finds an app by its name in the organization", () => {
        const { result } = renderHook(() => ({
            api: useApp("acme", "api"),
            elsewhere: useApp("side-projects", "api"),
        }));

        expect(result.current.api?.hostname).toBe(`api.${APPS_DOMAIN}`);
        expect(result.current.elsewhere).toBeUndefined();
    });

    it("marks an app as destroying, then removes it once torn down", () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => ({
            destroy: useDestroyApp(),
            blog: useApp("side-projects", "blog"),
        }));
        const id = result.current.blog?.id ?? "";

        act(() => result.current.destroy(id));
        expect(result.current.blog?.status).toBe("destroying");

        act(() => vi.advanceTimersByTime(TEARDOWN_MS));
        expect(result.current.blog).toBeUndefined();
    });
});
