import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TEARDOWN_MS } from "@/lib/apps/use-apps";
import { renderRoute } from "@/test/render-route";

const { getSession, toastSuccess } = vi.hoisted(() => ({
  getSession: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("sonner", async (original) => ({
  ...(await original<typeof import("sonner")>()),
  toast: { success: toastSuccess, error: vi.fn() },
}));

beforeEach(() => {
  toastSuccess.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("app", () => {
  it("shows the app's status, hostname and live deployment", async () => {
    await renderRoute("/organizations/acme/apps/api", getSession);

    await screen.findByRole("heading", { level: 1, name: "api" });
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /api\.apps\.quilt\.example/ }),
    ).toHaveAttribute("href", "https://api.apps.quilt.example");
    const live = within(
      screen.getByRole("region", { name: "Live deployment" }),
    );
    expect(live.getByText("v14")).toBeInTheDocument();
    expect(live.getByText("ghcr.io/acme/api:2.3.1")).toBeInTheDocument();
  });

  it("says when nothing has been deployed", async () => {
    await renderRoute("/organizations/acme/apps/docs-preview", getSession);

    const live = within(
      await screen.findByRole("region", { name: "Live deployment" }),
    );
    expect(live.getByText(/Nothing is deployed yet/)).toBeInTheDocument();
  });

  it.each([
    "/organizations/acme/apps/missing",
    "/organizations/side-projects/apps/api",
  ])("explains when %s isn't an app here", async (path) => {
    await renderRoute(path, getSession);

    expect(await screen.findByText("App not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All apps" })).toHaveAttribute(
      "href",
      path.replace(/\/[^/]+$/, ""),
    );
  });

  it("destroys the app once its name is typed, then removes it from the list", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const router = await renderRoute(
      "/organizations/acme/apps/web",
      getSession,
    );

    await user.click(
      await screen.findByRole("button", { name: "Destroy app" }),
    );
    const dialog = within(
      await screen.findByRole("alertdialog", { name: "Destroy web?" }),
    );
    const destroy = dialog.getByRole("button", { name: "Destroy app" });
    expect(destroy).toBeDisabled();
    await user.type(
      dialog.getByRole("textbox", { name: "Type web to confirm" }),
      "web",
    );
    await user.click(destroy);

    expect(toastSuccess).toHaveBeenCalledWith(
      "Destroying web… its workloads are being torn down",
    );
    expect(router.state.location.pathname).toBe("/organizations/acme/apps");
    const list = within(await screen.findByRole("list", { name: "Apps" }));
    expect(list.getByText("Destroying")).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(TEARDOWN_MS);
    expect(list.queryByRole("link", { name: "web" })).toBeNull();
  });
});
