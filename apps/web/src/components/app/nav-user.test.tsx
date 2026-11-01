import { SidebarProvider } from "@quilt/ui/components/sidebar";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NavUser } from "./nav-user";

const { signOut, navigate } = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { signOut } }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ to, ...props }: { to: string }) => <a href={to} {...props} />,
}));

vi.stubGlobal("matchMedia", () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
}));

describe("NavUser", () => {
  it("links to your account settings", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <NavUser user={{ name: "Ada Lovelace", email: "ada@example.com" }} />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: /ada lovelace/i }));

    expect(
      await screen.findByRole("menuitem", { name: "Account settings" }),
    ).toHaveAttribute("href", "/account");
  });

  it("logs out and returns to the landing page", async () => {
    signOut.mockImplementation(async ({ fetchOptions }) => {
      fetchOptions.onSuccess();
    });
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <NavUser user={{ name: "Ada Lovelace", email: "ada@example.com" }} />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: /ada lovelace/i }));

    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("stays on the page when sign-out fails", async () => {
    signOut.mockResolvedValue({
      data: null,
      error: { status: 500, message: "Internal Server Error" },
    });
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <NavUser user={{ name: "Ada Lovelace", email: "ada@example.com" }} />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: /ada lovelace/i }));

    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    expect(signOut).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
