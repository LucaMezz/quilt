import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ApiKey, useApiKeys } from "@/lib/api-keys/use-api-keys";
import { renderRoute } from "@/test/render-route";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("@/lib/api-keys/use-api-keys");

const DAY = 24 * 60 * 60 * 1000;

function key(overrides: Partial<ApiKey>): ApiKey {
  return {
    id: "key-1",
    name: "laptop",
    start: "qlt_ab",
    enabled: true,
    expiresAt: new Date(Date.now() + 60 * DAY),
    lastRequest: null,
    createdAt: new Date(Date.now() - 10 * DAY),
    permissions: { apps: ["read"] },
    ...overrides,
  };
}

function showKeys(keys: ApiKey[]) {
  vi.mocked(useApiKeys).mockReturnValue({ keys });
}

function rowFor(name: string) {
  const cell = screen.getByRole("rowheader", { name: new RegExp(name) });
  const row = cell.closest("tr");
  if (!row) throw new Error(`No row for ${name}`);
  return within(row);
}

describe("API keys settings", () => {
  it("is reachable from the settings navigation", async () => {
    showKeys([]);
    await renderRoute("/settings/api-keys", getSession);

    expect(
      await screen.findByRole("heading", { level: 2, name: "API keys" }),
    ).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Settings" });
    expect(within(nav).getByRole("link", { name: "API keys" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Profile" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("explains what keys are for when there are none", async () => {
    showKeys([]);
    await renderRoute("/settings/api-keys", getSession);

    expect(await screen.findByText("No API keys yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows each key's status and access", async () => {
    showKeys([
      key({ id: "k1", name: "laptop" }),
      key({
        id: "k2",
        name: "deploy-bot",
        start: "qlt_cd",
        permissions: { apps: ["read", "write"], user: ["read", "write"] },
      }),
      key({ id: "k3", name: "old-ci", enabled: false }),
      key({
        id: "k4",
        name: "expired",
        expiresAt: new Date(Date.now() - DAY),
      }),
      key({
        id: "k5",
        name: "short-lived",
        expiresAt: new Date(Date.now() + 2 * DAY),
        permissions: {},
      }),
    ]);
    await renderRoute("/settings/api-keys", getSession);
    await screen.findByRole("table", { name: "API keys" });

    const laptop = rowFor("laptop");
    expect(laptop.getByText("Active")).toBeInTheDocument();
    expect(laptop.getByText("Read-only")).toBeInTheDocument();
    expect(laptop.getByText("qlt_ab…")).toBeInTheDocument();

    const bot = rowFor("deploy-bot");
    expect(bot.getByText("Read and write")).toBeInTheDocument();
    expect(bot.getByText("Writes Apps, Profile")).toBeInTheDocument();

    expect(rowFor("old-ci").getByText("Disabled")).toBeInTheDocument();
    expect(rowFor("expired").getByText("Expired")).toBeInTheDocument();

    const shortLived = rowFor("short-lived");
    const soon = shortLived.getByText("Expires soon");
    expect(soon.closest("td")).toHaveTextContent("Active");
    expect(shortLived.getByText("No access")).toBeInTheDocument();
  });

  it("links each key to its own page", async () => {
    showKeys([key({ id: "k1", name: "laptop" })]);
    await renderRoute("/settings/api-keys", getSession);

    expect(await screen.findByRole("link", { name: /laptop/ })).toHaveAttribute(
      "href",
      "/settings/api-keys/k1",
    );
  });
});
