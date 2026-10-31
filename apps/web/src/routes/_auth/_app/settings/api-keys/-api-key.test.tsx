import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ApiKey,
  useApiKey,
  useApiKeys,
  useDeleteApiKey,
} from "@/lib/api-keys/use-api-keys";
import { renderRoute } from "@/test/render-route";

const { getSession, deleteKey } = vi.hoisted(() => ({
  getSession: vi.fn(),
  deleteKey: vi.fn(),
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
  permissions: { apps: ["read", "write"], user: ["read"] },
};

const path = `/settings/api-keys/${deployBot.id}`;

function rowFor(name: string) {
  const row = screen.getByRole("rowheader", { name }).closest("tr");
  if (!row) throw new Error(`No row for ${name}`);
  return within(row);
}

beforeEach(() => {
  vi.mocked(useApiKey).mockReturnValue(deployBot);
  vi.mocked(useApiKeys).mockReturnValue({ keys: [] });
  vi.mocked(useDeleteApiKey).mockReturnValue(deleteKey);
  deleteKey.mockReset();
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

  it("lists the access it has to every resource", async () => {
    await renderRoute(path, getSession);
    await screen.findByRole("table", { name: "Permissions" });

    expect(rowFor("Apps").getByText("Read and write")).toBeInTheDocument();
    expect(rowFor("Profile").getByText("Read-only")).toBeInTheDocument();
    expect(rowFor("Organizations").getByText("No access")).toBeInTheDocument();
    expect(rowFor("API keys").getByText("No access")).toBeInTheDocument();
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
});
