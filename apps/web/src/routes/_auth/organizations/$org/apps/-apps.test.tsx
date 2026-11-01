import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

function sidebar() {
  const content = document.querySelector("[data-sidebar=sidebar]");
  if (!(content instanceof HTMLElement)) throw new Error("No sidebar");
  return within(content);
}

describe("apps", () => {
  it("lists the organization's apps with their status", async () => {
    await renderRoute("/organizations/acme/apps", getSession);

    const list = await screen.findByRole("list", { name: "Apps" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("api");
    expect(items[0]).toHaveTextContent("Running");
    expect(items[0]).toHaveTextContent("v14");
    expect(within(list).getByText("Not deployed")).toBeInTheDocument();
    expect(within(list).getByText("No deployments yet")).toBeInTheDocument();
  });

  it("links each app's hostname in a new tab", async () => {
    await renderRoute("/organizations/acme/apps", getSession);

    const link = await screen.findByRole("link", {
      name: /api\.apps\.quilt\.example/,
    });
    expect(link).toHaveAttribute("href", "https://api.apps.quilt.example");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("doesn't show other organizations' apps", async () => {
    await renderRoute("/organizations/side-projects/apps", getSession);

    const list = await screen.findByRole("list", { name: "Apps" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).queryByText("api")).toBeNull();
  });

  it("sorts the table by status", async () => {
    const user = userEvent.setup();
    await renderRoute("/organizations/acme/apps?view=table", getSession);

    await user.click(await screen.findByRole("button", { name: "Status" }));

    const names = screen
      .getAllByRole("rowheader")
      .map((cell) => cell.textContent);
    expect(names).toEqual(["Aapi", "Bbilling-worker", "Wweb", "Ddocs-preview"]);
  });

  it("explains apps when the organization has none", async () => {
    await renderRoute("/organizations/open-source/apps", getSession);

    expect(await screen.findByText("No apps yet")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "View" })).toBeNull();
  });

  it("is linked from the organization sidebar", async () => {
    await renderRoute("/organizations/acme/apps", getSession);

    await screen.findByRole("heading", { level: 1, name: "Apps" });
    expect(sidebar().getByRole("link", { name: "Apps" })).toHaveAttribute(
      "data-active",
    );
    expect(
      sidebar().getByRole("link", { name: "Dashboard" }),
    ).not.toHaveAttribute("data-active");
  });

  it.each([
    ["acme", 1],
    ["open-source", 2],
  ])("links to creating an app from %s's apps", async (org, count) => {
    const user = userEvent.setup();
    const router = await renderRoute(`/organizations/${org}/apps`, getSession);

    const links = await screen.findAllByRole("link", { name: "New app" });
    expect(links).toHaveLength(count);
    for (const link of links) {
      expect(link).toHaveAttribute("href", `/organizations/${org}/apps/new`);
    }

    await user.click(links[links.length - 1] as HTMLElement);
    expect(router.state.location.pathname).toBe(
      `/organizations/${org}/apps/new`,
    );
  });

  it("opens an app from the list", async () => {
    const user = userEvent.setup();
    const router = await renderRoute("/organizations/acme/apps", getSession);

    await user.click(await screen.findByRole("link", { name: "web" }));

    expect(router.state.location.pathname).toBe("/organizations/acme/apps/web");
  });
});
