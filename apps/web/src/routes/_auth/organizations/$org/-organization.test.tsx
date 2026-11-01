import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

vi.mock("@/lib/organizations/use-organizations", async (original) => {
  const organizations = [
    { id: "org_1", name: "Acme", slug: "acme", role: "owner" },
    {
      id: "org_2",
      name: "Side projects",
      slug: "side-projects",
      role: "admin",
    },
  ];
  return {
    ...(await original<object>()),
    useOrganizations: () => organizations,
    useOrganization: (slug: string) =>
      organizations.find((organization) => organization.slug === slug),
  };
});

function sidebar() {
  const content = document.querySelector("[data-sidebar=sidebar]");
  if (!(content instanceof HTMLElement)) throw new Error("No sidebar");
  return within(content);
}

async function openSwitcher() {
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("button", { name: /switch organization/ }),
  );
  return screen.findByRole("menu");
}

describe("organization", () => {
  it("opens the organization's dashboard from its URL name", async () => {
    await renderRoute("/organizations/side-projects", getSession);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Side projects" }),
    ).toBeInTheDocument();
    expect(
      sidebar().getByRole("button", { name: /switch organization/ }),
    ).toHaveTextContent("Side projectsAdmin");
    expect(sidebar().getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/organizations/side-projects",
    );
  });

  it("switches to your other organizations", async () => {
    await renderRoute("/organizations/acme", getSession);

    const menu = await openSwitcher();

    expect(
      within(menu).getByRole("menuitem", { name: "Acme" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(menu).getByRole("menuitem", { name: "Side projects" }),
    ).toHaveAttribute("href", "/organizations/side-projects");
  });

  it("leads back to all your organizations", async () => {
    const router = await renderRoute("/organizations/acme", getSession);

    const menu = await openSwitcher();
    await userEvent.click(
      within(menu).getByRole("menuitem", { name: "All organizations" }),
    );

    expect(router.state.location.pathname).toBe("/organizations");
  });

  it("offers to create another organization", async () => {
    await renderRoute("/organizations/acme", getSession);

    const menu = await openSwitcher();

    expect(
      within(menu).getByRole("menuitem", { name: "New organization" }),
    ).toHaveAttribute("href", "/organizations/new");
  });

  it("explains when the organization doesn't exist", async () => {
    await renderRoute("/organizations/nope", getSession);

    expect(
      await screen.findByText("Organization not found"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "All organizations" }),
    ).toHaveAttribute("href", "/organizations");
    expect(document.querySelector("[data-sidebar=sidebar]")).toBeNull();
  });
});
