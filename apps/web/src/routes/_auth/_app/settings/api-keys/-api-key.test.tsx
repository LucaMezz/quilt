import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ApiKey,
  useApiKey,
  useApiKeys,
  useDeleteApiKey,
  useRegenerateApiKey,
  useUpdateApiKeyOrganizations,
  useUpdateApiKeyPermissions,
} from "@/lib/api-keys/use-api-keys";
import { renderRoute } from "@/test/render-route";

const {
  getSession,
  deleteKey,
  regenerateKey,
  updatePermissions,
  updateOrganizations,
} = vi.hoisted(() => ({
  getSession: vi.fn(),
  deleteKey: vi.fn(),
  regenerateKey: vi.fn(),
  updatePermissions: vi.fn(),
  updateOrganizations: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("@/lib/api-keys/use-api-keys");

const DAY = 24 * 60 * 60 * 1000;

const deployBot: ApiKey = {
  id: "NbL55QdT9wRk2HsE6mZyPc3Vx8Ga1JfU",
  name: "deploy-bot",
  description: null,
  start: "qlt_Nb",
  enabled: true,
  expiresAt: new Date(Date.now() + 60 * DAY),
  lastRequest: null,
  createdAt: new Date(Date.now() - 10 * DAY),
  organizations: "all",
  permissions: { apps: ["read", "write"], user: ["read"] },
};

const path = `/settings/api-keys/${deployBot.id}`;

const NEW_SECRET = "qlt_N3wS3cretValueThatIsOnlyShownOnce";

function rowFor(name: string) {
  const row = screen
    .getByRole("rowheader", { name: new RegExp(`^${name}`) })
    .closest("tr");
  if (!row) throw new Error(`No row for ${name}`);
  return within(row);
}

function updateButton() {
  return screen.getByRole("button", { name: "Update permissions" });
}

beforeEach(() => {
  vi.mocked(useApiKey).mockReturnValue(deployBot);
  vi.mocked(useApiKeys).mockReturnValue({ keys: [] });
  vi.mocked(useDeleteApiKey).mockReturnValue(deleteKey);
  vi.mocked(useRegenerateApiKey).mockReturnValue(regenerateKey);
  vi.mocked(useUpdateApiKeyPermissions).mockReturnValue(updatePermissions);
  updatePermissions.mockReset();
  vi.mocked(useUpdateApiKeyOrganizations).mockReturnValue(updateOrganizations);
  updateOrganizations.mockReset();
  deleteKey.mockReset();
  regenerateKey.mockReset().mockReturnValue(NEW_SECRET);
});

describe("API key page", () => {
  it("shows the key's status and details", async () => {
    await renderRoute(path, getSession);

    expect(
      await screen.findByRole("heading", { level: 2, name: /deploy-bot/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("qlt_Nb…")).toBeInTheDocument();
    expect(screen.getByText(deployBot.id)).toBeInTheDocument();
    expect(screen.getByText("Never used")).toBeInTheDocument();
    expect(useApiKey).toHaveBeenCalledWith(deployBot.id);
  });

  it("shows the key's description when it has one", async () => {
    vi.mocked(useApiKey).mockReturnValue({
      ...deployBot,
      description: "Deploys the website from CI",
    });
    await renderRoute(path, getSession);

    expect(
      await screen.findByText("Deploys the website from CI"),
    ).toBeInTheDocument();
  });

  it("lists only the resources the key can access", async () => {
    await renderRoute(path, getSession);
    await screen.findByRole("table", { name: "Permissions" });

    expect(
      rowFor("Apps").getByRole("combobox", { name: "Apps access" }),
    ).toHaveTextContent("Read and write");
    expect(
      rowFor("Profile").getByRole("combobox", { name: "Profile access" }),
    ).toHaveTextContent("Read-only");
    expect(
      screen.queryByRole("rowheader", { name: /^Organizations/ }),
    ).not.toBeInTheDocument();
    expect(updateButton()).toBeDisabled();
  });

  it("applies level changes, removals and additions only on update", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);

    await user.click(
      await screen.findByRole("combobox", { name: "Profile access" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "Read and write" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove Apps" }));
    await user.click(screen.getByRole("button", { name: "Add permission" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Add a permission",
    });
    await user.click(within(dialog).getByLabelText("Resource"));
    await user.click(await screen.findByRole("option", { name: "API keys" }));
    await user.click(
      within(dialog).getByRole("button", { name: "Add permission" }),
    );

    expect(screen.getByText("You have unsaved changes.")).toBeVisible();
    expect(
      screen.queryByRole("rowheader", { name: /^Apps/ }),
    ).not.toBeInTheDocument();
    expect(updatePermissions).not.toHaveBeenCalled();

    await user.click(updateButton());

    expect(updatePermissions).toHaveBeenCalledExactlyOnceWith(deployBot.id, {
      user: ["read", "write"],
      apiKeys: ["read"],
    });
  });

  it("discards unsaved changes", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);

    await user.click(
      await screen.findByRole("button", { name: "Remove Apps" }),
    );
    await user.click(
      within(screen.getByRole("region", { name: "Permissions" })).getByRole(
        "button",
        { name: "Discard" },
      ),
    );

    expect(screen.getByRole("rowheader", { name: /^Apps/ })).toBeVisible();
    expect(updateButton()).toBeDisabled();
    expect(updatePermissions).not.toHaveBeenCalled();
  });

  it("says when a key has no permissions left", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);

    await user.click(
      await screen.findByRole("button", { name: "Remove Apps" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove Profile" }));

    expect(screen.getByText("No permissions")).toBeVisible();
    expect(
      screen.queryByRole("table", { name: "Permissions" }),
    ).not.toBeInTheDocument();
  });

  it("limits a key to chosen organizations only on update", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);
    const card = within(
      await screen.findByRole("region", { name: "Organization access" }),
    );
    const update = card.getByRole("button", {
      name: "Update organization access",
    });

    expect(
      card.getByRole("radio", { name: /All organizations/ }),
    ).toBeChecked();
    await user.click(card.getByRole("radio", { name: /Only selected/ }));

    expect(card.getByText("Choose at least one organization")).toBeVisible();
    expect(update).toBeDisabled();

    await user.click(card.getByRole("checkbox", { name: "Acme" }));
    expect(updateOrganizations).not.toHaveBeenCalled();
    await user.click(update);

    expect(updateOrganizations).toHaveBeenCalledExactlyOnceWith(deployBot.id, [
      "org_7Hq2",
    ]);
  });

  it("shows a key's selected organizations and can widen it to all", async () => {
    vi.mocked(useApiKey).mockReturnValue({
      ...deployBot,
      organizations: ["org_K9vD"],
    });
    const user = userEvent.setup();
    await renderRoute(path, getSession);
    const card = within(
      await screen.findByRole("region", { name: "Organization access" }),
    );

    expect(card.getByRole("checkbox", { name: "Side projects" })).toBeChecked();
    expect(card.getByRole("checkbox", { name: "Acme" })).not.toBeChecked();

    await user.click(card.getByRole("radio", { name: /All organizations/ }));
    await user.click(
      card.getByRole("button", { name: "Update organization access" }),
    );

    expect(updateOrganizations).toHaveBeenCalledExactlyOnceWith(
      deployBot.id,
      "all",
    );
  });

  it("discards organization changes", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);
    const card = within(
      await screen.findByRole("region", { name: "Organization access" }),
    );

    await user.click(card.getByRole("radio", { name: /Only selected/ }));
    await user.click(card.getByRole("button", { name: "Discard" }));

    expect(
      card.getByRole("radio", { name: /All organizations/ }),
    ).toBeChecked();
    expect(card.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("says when the key doesn't exist", async () => {
    vi.mocked(useApiKey).mockReturnValue(undefined);
    await renderRoute("/settings/api-keys/nope", getSession);

    expect(await screen.findByText("API key not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to API keys" }),
    ).toHaveAttribute("href", "/settings/api-keys");
  });

  it("keeps the key when deletion is cancelled", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);

    await user.click(await screen.findByRole("button", { name: "Delete key" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: /delete deploy-bot/i,
    });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(deleteKey).not.toHaveBeenCalled();
  });

  it("deletes the key once confirmed and returns to the list", async () => {
    const user = userEvent.setup();
    const router = await renderRoute(path, getSession);

    await user.click(await screen.findByRole("button", { name: "Delete key" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete key" }),
    );

    expect(deleteKey).toHaveBeenCalledWith(deployBot.id);
    await vi.waitFor(() =>
      expect(router.state.location.pathname).toBe("/settings/api-keys"),
    );
  });

  it("keeps the current key when regenerating is cancelled", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);

    await user.click(
      await screen.findByRole("button", { name: "Regenerate key" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: /regenerate deploy-bot/i,
    });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(regenerateKey).not.toHaveBeenCalled();
  });

  it("regenerates with the chosen expiration and shows the new key once", async () => {
    const user = userEvent.setup();
    await renderRoute(path, getSession);

    await user.click(
      await screen.findByRole("button", { name: "Regenerate key" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByLabelText("Expiration"));
    await user.click(await screen.findByRole("option", { name: "90 days" }));
    await user.click(
      within(dialog).getByRole("button", { name: "Regenerate key" }),
    );

    expect(regenerateKey).toHaveBeenCalledWith(deployBot.id, 90);
    expect(await screen.findByLabelText("New key")).toHaveValue(NEW_SECRET);

    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.click(
      await screen.findByRole("button", { name: "Regenerate key" }),
    );

    expect(await screen.findByLabelText("Expiration")).toBeInTheDocument();
    expect(screen.queryByDisplayValue(NEW_SECRET)).not.toBeInTheDocument();
  });
});
