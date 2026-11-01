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
vi.mock("@/lib/organizations/use-organizations", () => ({
  useOrganizations: () => [
    { id: "org_1", name: "Acme", slug: "acme", role: "owner" },
  ],
  useCreateOrganization: () => create,
}));

beforeEach(() => {
  create.mockReset();
  create.mockImplementation(({ name, slug }) => ({
    id: "org_new",
    name,
    slug,
    role: "owner",
  }));
  toastSuccess.mockReset();
});

async function renderPage() {
  const router = await renderRoute("/organizations/new", getSession);
  await screen.findByRole("heading", { level: 1, name: "New organization" });
  return {
    router,
    name: screen.getByRole("textbox", { name: "Name" }),
    slug: screen.getByRole("textbox", { name: "URL name" }),
    submit: screen.getByRole("button", { name: "Create organization" }),
  };
}

describe("new organization", () => {
  it("fills in the URL name from the name", async () => {
    const user = userEvent.setup();
    const { name, slug } = await renderPage();

    await user.type(name, "Café Labs");

    expect(slug).toHaveValue("cafe-labs");
    expect(slug).toHaveAccessibleDescription(/like \/cafe-labs\./);
  });

  it("stops following the name once you edit the URL name", async () => {
    const user = userEvent.setup();
    const { name, slug } = await renderPage();

    await user.type(name, "Labs");
    await user.clear(slug);
    await user.type(slug, "the-lab");
    await user.type(name, " Two");

    expect(slug).toHaveValue("the-lab");
  });

  it("creates the organization and returns to the list", async () => {
    const user = userEvent.setup();
    const { router, name, submit } = await renderPage();

    await user.type(name, "  Labs ");
    await user.click(submit);

    expect(create).toHaveBeenCalledWith({ name: "Labs", slug: "labs" });
    expect(toastSuccess).toHaveBeenCalledWith("Created Labs");
    expect(router.state.location.pathname).toBe("/organizations");
  });

  it.each([
    ["", "", ["Enter a name", "Enter a URL name"]],
    ["Acme", "acme", ["That URL name is already taken"]],
    ["Accounts", "account", ["That URL name is reserved by quilt"]],
  ])(
    "rejects name %j with URL name %j",
    async (nameValue, slugValue, problems) => {
      const user = userEvent.setup();
      const { name, slug, submit } = await renderPage();

      if (nameValue) await user.type(name, nameValue);
      await user.clear(slug);
      if (slugValue) await user.type(slug, slugValue);
      await user.click(submit);

      for (const problem of problems) {
        expect(await screen.findByText(problem)).toBeInTheDocument();
      }
      expect(create).not.toHaveBeenCalled();
    },
  );
});
