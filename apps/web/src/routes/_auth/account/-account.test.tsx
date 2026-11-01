import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

function sidebar() {
  const content = document.querySelector("[data-sidebar=sidebar]");
  if (!(content instanceof HTMLElement)) throw new Error("No sidebar");
  return within(content);
}

describe("account", () => {
  it("has its own sidebar without organization pages", async () => {
    await renderRoute("/account", getSession);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Account" }),
    ).toBeInTheDocument();
    expect(sidebar().queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(sidebar().queryByText("Soon")).toBeNull();
  });

  it.each([
    ["/account", "Profile", "API keys"],
    ["/account/api-keys", "API keys", "Profile"],
  ])("marks only the current page at %s", async (path, current, other) => {
    await renderRoute(path, getSession);

    await screen.findByRole("heading", { level: 1, name: "Account" });
    expect(sidebar().getByRole("link", { name: current })).toHaveAttribute(
      "data-active",
    );
    expect(sidebar().getByRole("link", { name: other })).not.toHaveAttribute(
      "data-active",
    );
  });

  it("leaves account pages out of the organization sidebar", async () => {
    await renderRoute("/dashboard", getSession);

    await screen.findByRole("heading", { level: 1 });
    const dashboard = sidebar().getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("data-active");
    expect(sidebar().getByText("General")).toBeInTheDocument();
    expect(sidebar().getAllByText("Soon")).toHaveLength(3);
    expect(sidebar().queryByText("Account")).toBeNull();
  });
});
