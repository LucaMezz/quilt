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
    description: null,
    start: "qlt_ab",
    enabled: true,
    expiresAt: new Date(Date.now() + 60 * DAY),
    lastRequest: null,
    createdAt: new Date(Date.now() - 10 * DAY),
    organizations: "all",
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
  it("has an API keys heading", async () => {
    showKeys([]);
    await renderRoute("/account/api-keys", getSession);

    expect(
      await screen.findByRole("heading", { level: 2, name: "API keys" }),
    ).toBeInTheDocument();
  });

  it("explains what keys are for when there are none", async () => {
    showKeys([]);
    await renderRoute("/account/api-keys", getSession);

    expect(await screen.findByText("No API keys yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create key" })).toHaveAttribute(
      "href",
      "/account/api-keys/new",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("offers a new key and warns to keep keys secure", async () => {
    showKeys([key({})]);
    await renderRoute("/account/api-keys", getSession);

    const card = await screen.findByRole("region", { name: "API keys" });
    expect(within(card).getByRole("link", { name: "New key" })).toHaveAttribute(
      "href",
      "/account/api-keys/new",
    );
    expect(within(card).getByRole("note")).toHaveTextContent(
      "Keep your keys secure",
    );
  });

  it("lists each key's name, prefix, status and dates", async () => {
    showKeys([
      key({
        id: "k1",
        name: "laptop",
        description: "Work laptop CLI",
        lastRequest: new Date(Date.now() - 2 * DAY),
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
      }),
    ]);
    await renderRoute("/account/api-keys", getSession);
    const table = await screen.findByRole("table", { name: "API keys" });

    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Name", "Key", "Status", "Created", "Last used"]);

    const laptop = rowFor("laptop");
    expect(laptop.getByText("qlt_ab…")).toBeInTheDocument();
    expect(laptop.getByText("Active")).toBeInTheDocument();
    expect(laptop.getByText("10 days ago")).toBeInTheDocument();
    expect(laptop.getByText("2 days ago")).toBeInTheDocument();
    expect(laptop.queryByText("Work laptop CLI")).toBeNull();

    const oldCi = rowFor("old-ci");
    expect(oldCi.getByText("Disabled")).toBeInTheDocument();
    expect(oldCi.getByText("Never used")).toBeInTheDocument();
    expect(rowFor("expired").getByText("Expired")).toBeInTheDocument();

    const soon = rowFor("short-lived").getByText("Expires soon");
    expect(soon.closest("td")).toHaveTextContent("Active");
  });

  it("links each key to its own page", async () => {
    showKeys([key({ id: "k1", name: "laptop" })]);
    await renderRoute("/account/api-keys", getSession);

    expect(await screen.findByRole("link", { name: /laptop/ })).toHaveAttribute(
      "href",
      "/account/api-keys/k1",
    );
  });
});
