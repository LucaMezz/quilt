import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateApiKey } from "@/lib/api-keys/use-api-keys";
import { renderRoute } from "@/test/render-route";

const { getSession, createKey } = vi.hoisted(() => ({
  getSession: vi.fn(),
  createKey: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("@/lib/api-keys/use-api-keys");

const SECRET = "qlt_N3wS3cretValueThatIsOnlyShownOnce";

beforeEach(() => {
  vi.mocked(useCreateApiKey).mockReturnValue(createKey);
  createKey.mockReset().mockReturnValue({ id: "new-key", secret: SECRET });
});

async function openPage() {
  const user = userEvent.setup();
  const router = await renderRoute("/settings/api-keys/new", getSession);
  await screen.findByRole("heading", { level: 2, name: "New API key" });
  return { user, router };
}

async function addPermission(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add permission" }));
  const dialog = await screen.findByRole("dialog", {
    name: "Add a permission",
  });
  await user.click(
    within(dialog).getByRole("button", { name: "Add permission" }),
  );
}

describe("New API key page", () => {
  it("explains what's missing and creates nothing", async () => {
    const { user } = await openPage();

    await user.click(screen.getByRole("button", { name: "Create key" }));

    expect(await screen.findByText("Give the key a name")).toBeVisible();
    expect(screen.getByText("Add at least one permission")).toBeVisible();
    expect(createKey).not.toHaveBeenCalled();
  });

  it("asks for organizations when access is limited to some", async () => {
    const { user } = await openPage();

    await user.type(screen.getByRole("textbox", { name: "Name" }), "ci");
    await addPermission(user);
    await user.click(
      screen.getByRole("radio", { name: /Only selected organizations/ }),
    );
    await user.click(screen.getByRole("button", { name: "Create key" }));

    expect(
      await screen.findByText("Choose at least one organization"),
    ).toBeVisible();
    expect(createKey).not.toHaveBeenCalled();
  });

  it("creates the key, shows its secret once and links to it", async () => {
    const { user, router } = await openPage();

    await user.type(
      screen.getByRole("textbox", { name: "Name" }),
      "  github actions ",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Description" }),
      "Deploys the website",
    );
    await user.click(
      screen.getByRole("radio", { name: /Only selected organizations/ }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Acme" }));
    await addPermission(user);
    await user.click(screen.getByRole("button", { name: "Create key" }));

    expect(createKey).toHaveBeenCalledExactlyOnceWith({
      name: "github actions",
      description: "Deploys the website",
      expiresInDays: 30,
      organizations: ["org_7Hq2"],
      permissions: { organizations: ["read"] },
    });
    const card = await screen.findByRole("region", {
      name: "Copy your new key",
    });
    expect(within(card).getByRole("textbox")).toHaveValue(SECRET);

    await user.click(within(card).getByRole("link", { name: "Done" }));

    expect(router.state.location.pathname).toBe("/settings/api-keys/new-key");
  });

  it("gives every organization access by default", async () => {
    const { user } = await openPage();

    await user.type(screen.getByRole("textbox", { name: "Name" }), "ci");
    await addPermission(user);
    await user.click(screen.getByRole("button", { name: "Create key" }));

    expect(createKey).toHaveBeenCalledWith(
      expect.objectContaining({ organizations: "all", description: null }),
    );
  });
});
