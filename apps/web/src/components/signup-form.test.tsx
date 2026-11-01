import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "./signup-form";

const { signUpEmail, navigate } = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ isPending: false }),
    signUp: { email: signUpEmail },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

async function fillIn(fields: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Name"), fields.name);
  await user.type(screen.getByLabelText("Email"), fields.email);
  await user.type(screen.getByLabelText("Password"), fields.password);
  await user.type(
    screen.getByLabelText("Confirm Password"),
    fields.confirmPassword,
  );
  await user.click(screen.getByRole("button", { name: "Create Account" }));
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors and does not submit invalid input", async () => {
    render(<SignupForm />);

    await fillIn({
      name: "A",
      email: "ada@example",
      password: "short",
      confirmPassword: "short",
    });

    expect(
      await screen.findByText("Name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    render(<SignupForm />);

    await fillIn({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse",
      confirmPassword: "battery-staple",
    });

    expect(
      await screen.findByText("Passwords don't match"),
    ).toBeInTheDocument();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("signs up and navigates to your organizations on success", async () => {
    signUpEmail.mockImplementation(async (_body, { onSuccess }) => {
      onSuccess();
    });
    render(<SignupForm />);

    await fillIn({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse",
      confirmPassword: "correct-horse",
    });

    expect(signUpEmail).toHaveBeenCalledWith(
      {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "correct-horse",
      },
      expect.any(Object),
    );
    expect(navigate).toHaveBeenCalledWith({ to: "/organizations" });
  });

  it("links to the sign-in page", () => {
    render(<SignupForm />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
