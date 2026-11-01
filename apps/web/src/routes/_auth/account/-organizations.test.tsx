import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

vi.mock("@/lib/organizations/use-organizations", () => ({
  useOrganizations: () => [
    { id: "org_1", name: "Acme", role: "owner" },
    { id: "org_2", name: "Side projects", role: "member" },
  ],
}));

describe("organizations", () => {
  it("lists every organization you belong to with your role", async () => {
    await renderRoute("/account/organizations", getSession);

    const acme = await screen.findByRole("link", { name: /Acme/ });
    expect(acme).toHaveTextContent("Owner");
    expect(
      screen.getByRole("link", { name: /Side projects/ }),
    ).toHaveTextContent("Member");
  });

  it("opens an organization's dashboard", async () => {
    await renderRoute("/account/organizations", getSession);

    expect(await screen.findByRole("link", { name: /Acme/ })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
