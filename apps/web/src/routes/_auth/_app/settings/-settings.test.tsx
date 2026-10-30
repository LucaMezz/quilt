import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));

describe("settings", () => {
  it("has a settings heading and navigation", async () => {
    await renderRoute("/settings", getSession);

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
    await renderRoute("/settings", getSession);

    expect(
      await screen.findByRole("heading", { level: 2, name: "Profile" }),
    ).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(within(main).getByText("Ada Lovelace")).toBeInTheDocument();
    expect(within(main).getByText("ada@example.com")).toBeInTheDocument();
  });
});
