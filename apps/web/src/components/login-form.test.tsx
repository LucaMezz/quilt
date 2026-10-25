// Example component tests: render with Testing Library and mock the auth client
// and router, so no server is needed. Copy this pattern for real tests.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

const { signInEmail, navigate } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ isPending: false }),
    signIn: { email: signInEmail },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors and does not submit invalid input", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Passes the browser's type="email" check (which would block submit) but
    // fails the Zod schema, which requires a TLD.
    await user.type(screen.getByLabelText("Email"), "ada@example");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Invalid email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("signs in and navigates to the dashboard on success", async () => {
    signInEmail.mockImplementation(async (_body, { onSuccess }) => {
      onSuccess();
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signInEmail).toHaveBeenCalledWith(
      { email: "ada@example.com", password: "correct-horse" },
      expect.any(Object),
    );
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("links to the sign-up page", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});
