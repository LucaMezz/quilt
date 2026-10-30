import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

vi.stubGlobal("matchMedia", () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
}));

async function renderAt(path: string) {
  getSession.mockResolvedValue({
    data: {
      user: {
        id: "u1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        image: null,
      },
      session: { id: "s1" },
    },
  });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: {} as never,
  });
  render(<RouterProvider router={router} />);
  await router.load();
  return router;
}

describe("settings", () => {
  it("has a settings heading and navigation", async () => {
    await renderAt("/settings");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Settings" }),
    ).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Settings" });
    expect(within(nav).getByRole("link", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows your profile", async () => {
    await renderAt("/settings");

    expect(
      await screen.findByRole("heading", { level: 2, name: "Profile" }),
    ).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(within(main).getByText("Ada Lovelace")).toBeInTheDocument();
    expect(within(main).getByText("ada@example.com")).toBeInTheDocument();
  });
});
