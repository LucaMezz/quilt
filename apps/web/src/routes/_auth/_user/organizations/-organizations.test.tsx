import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession, organizations } = vi.hoisted(() => ({
  getSession: vi.fn(),
  organizations: { current: [] as unknown[] },
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

vi.mock("@/lib/organizations/use-organizations", () => ({
  useOrganizations: () => organizations.current,
}));

beforeEach(() => {
  organizations.current = [
    { id: "org_1", name: "Acme", slug: "acme", role: "owner" },
    {
      id: "org_2",
      name: "Side projects",
      slug: "side-projects",
      role: "member",
    },
  ];
});

describe("organizations", () => {
  it("has its own heading rather than the account one", async () => {
    await renderRoute("/organizations", getSession);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Organizations" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Account" })).toBeNull();
  });

  it("shows each organization with your role as a grid by default", async () => {
    await renderRoute("/organizations", getSession);

    const list = await screen.findByRole("list", { name: "Organizations" });
    const [acme, side] = within(list).getAllByRole("listitem");
    expect(acme).toHaveTextContent("Acme");
    expect(acme).toHaveTextContent("Owner");
    expect(side).toHaveTextContent("Member");
    const views = screen.getByRole("group", { name: "View" });
    expect(within(views).getByRole("button", { name: "Grid" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("opens in the view named in the URL", async () => {
    await renderRoute("/organizations?view=table", getSession);

    const table = await screen.findByRole("table", { name: "Organizations" });
    expect(
      within(table).getByRole("rowheader", { name: "Acme" }),
    ).toBeVisible();
  });

  it("keeps the view you switch to in the URL", async () => {
    const router = await renderRoute("/organizations", getSession);

    await userEvent.click(await screen.findByRole("button", { name: "Table" }));

    expect(router.state.location.search).toEqual({ view: "table" });
    expect(
      screen.getByRole("table", { name: "Organizations" }),
    ).toBeInTheDocument();
  });

  it("opens an organization's dashboard", async () => {
    await renderRoute("/organizations?view=list", getSession);

    expect(await screen.findByRole("link", { name: "Acme" })).toHaveAttribute(
      "href",
      "/organizations/acme",
    );
  });

  it("explains what organizations are when you have none", async () => {
    organizations.current = [];
    await renderRoute("/organizations", getSession);

    expect(await screen.findByText("No organizations yet")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "View" })).toBeNull();
    expect(
      screen.getAllByRole("link", { name: "New organization" }),
    ).toHaveLength(2);
  });

  it("always offers to create an organization", async () => {
    await renderRoute("/organizations", getSession);

    expect(
      await screen.findByRole("link", { name: "New organization" }),
    ).toHaveAttribute("href", "/organizations/new");
  });
});
