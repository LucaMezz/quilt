import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { TryItLink } from "./try-it-link";

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("TryItLink", () => {
  it("links signed-out visitors to the login page", () => {
    useSession.mockReturnValue({ data: null, isPending: false });
    render(<TryItLink />);

    expect(
      screen.getByRole("link", { name: "Sign in and try it" }),
    ).toHaveAttribute("href", "/login");
  });

  it("links signed-in users to the dashboard", () => {
    useSession.mockReturnValue({
      data: { user: { name: "Ada" } },
      isPending: false,
    });
    render(<TryItLink />);

    expect(
      screen.getByRole("link", { name: "Open dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("renders no link while the session is loading", () => {
    useSession.mockReturnValue({ data: null, isPending: true });
    render(<TryItLink />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
