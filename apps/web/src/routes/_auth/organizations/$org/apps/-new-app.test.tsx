import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession, create, toastSuccess } = vi.hoisted(() => ({
  getSession: vi.fn(),
  create: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("sonner", async (original) => ({
  ...(await original<typeof import("sonner")>()),
  toast: { success: toastSuccess, error: vi.fn() },
}));
vi.mock("@/lib/apps/use-apps", async (original) => ({
  ...(await original<typeof import("@/lib/apps/use-apps")>()),
  useAppNameTaken: () => (name: string) => name === "blog",
  useCreateApp: () => create,
}));

beforeEach(() => {
  create.mockReset();
  create.mockImplementation(({ name }) => ({ name }));
  toastSuccess.mockReset();
});

async function renderPage() {
  const router = await renderRoute("/organizations/acme/apps/new", getSession);
  await screen.findByRole("heading", { level: 1, name: "New app" });
  return {
    router,
    name: screen.getByRole("textbox", { name: "Name" }),
    submit: screen.getByRole("button", { name: "Create app" }),
  };
}

describe("new app", () => {
  it("previews the hostname and warns the name is permanent", async () => {
    const user = userEvent.setup();
    const { name } = await renderPage();

    await user.type(name, "shop");

    expect(name).toHaveAccessibleDescription(
      /Served at shop\.apps\.quilt\.example\..*can't be changed later/,
    );
  });

  it("creates the app and returns to the organization's apps", async () => {
    const user = userEvent.setup();
    const { router, name, submit } = await renderPage();

    await user.type(name, "shop");
    await user.click(submit);

    expect(create).toHaveBeenCalledWith({ organization: "acme", name: "shop" });
    expect(toastSuccess).toHaveBeenCalledWith("Created app shop");
    expect(router.state.location.pathname).toBe("/organizations/acme/apps");
  });

  it.each([
    ["", "Enter a name"],
    ["Shop", "Use lowercase letters, numbers and dashes"],
    ["blog", "That name is already taken"],
  ])("rejects %j", async (value, problem) => {
    const user = userEvent.setup();
    const { name, submit } = await renderPage();

    if (value) await user.type(name, value);
    await user.click(submit);

    expect(await screen.findByText(new RegExp(problem))).toBeInTheDocument();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(create).not.toHaveBeenCalled();
  });

  it("goes back to the apps without creating anything", async () => {
    const user = userEvent.setup();
    const { router } = await renderPage();

    await user.click(screen.getByRole("link", { name: "Cancel" }));

    expect(router.state.location.pathname).toBe("/organizations/acme/apps");
    expect(create).not.toHaveBeenCalled();
  });
});
