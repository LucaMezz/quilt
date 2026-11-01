import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render-route";

const { getSession, update, toastSuccess } = vi.hoisted(() => ({
  getSession: vi.fn(),
  update: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("sonner", async (original) => ({
  ...(await original<typeof import("sonner")>()),
  toast: { success: toastSuccess, error: vi.fn() },
}));
vi.mock("@/lib/organizations/use-organizations", async (original) => ({
  ...(await original<typeof import("@/lib/organizations/use-organizations")>()),
  useUpdateOrganization: () => update,
}));

beforeEach(() => {
  update.mockReset();
  toastSuccess.mockReset();
});

async function renderSettings(org = "acme") {
  const router = await renderRoute(
    `/organizations/${org}/settings`,
    getSession,
  );
  const general = within(
    await screen.findByRole("region", { name: "General" }),
  );
  return {
    router,
    general,
    name: general.getByRole("textbox", { name: "Name" }),
    slug: general.getByRole("textbox", { name: "URL name" }),
  };
}

describe("organization settings", () => {
  it("shows the organization's details", async () => {
    await renderSettings();

    const details = within(screen.getByRole("region", { name: "Details" }));
    expect(details.getByText("org_7Hq2")).toBeInTheDocument();
    expect(details.getByText("Owner")).toBeInTheDocument();
  });

  it("renames the organization", async () => {
    const user = userEvent.setup();
    const { router, general, name } = await renderSettings();
    const save = general.getByRole("button", { name: "Update organization" });
    expect(save).toBeDisabled();

    await user.clear(name);
    await user.type(name, " Acme Inc ");
    await user.click(save);

    expect(update).toHaveBeenCalledWith("org_7Hq2", {
      name: "Acme Inc",
      slug: "acme",
    });
    expect(toastSuccess).toHaveBeenCalledWith("Updated Acme Inc");
    expect(router.state.location.pathname).toBe("/organizations/acme/settings");
  });

  it("moves to the new URL after changing the URL name", async () => {
    const user = userEvent.setup();
    const { router, general, slug } = await renderSettings();

    await user.clear(slug);
    await user.type(slug, "acme-inc");
    await user.click(
      general.getByRole("button", { name: "Update organization" }),
    );

    expect(update).toHaveBeenCalledWith("org_7Hq2", {
      name: "Acme",
      slug: "acme-inc",
    });
    expect(router.state.location.pathname).toBe(
      "/organizations/acme-inc/settings",
    );
  });

  it.each([
    ["side-projects", "That URL name is already taken"],
    ["new", "That URL name is reserved by quilt"],
    ["Acme", "Use lowercase letters, numbers and single dashes between them"],
  ])("rejects the URL name %j", async (value, problem) => {
    const user = userEvent.setup();
    const { general, slug } = await renderSettings();

    await user.clear(slug);
    await user.type(slug, value);
    await user.click(
      general.getByRole("button", { name: "Update organization" }),
    );

    expect(await general.findByText(problem)).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });

  it("discards changes", async () => {
    const user = userEvent.setup();
    const { general, name } = await renderSettings();

    await user.type(name, " Inc");
    await user.click(general.getByRole("button", { name: "Discard" }));

    expect(name).toHaveValue("Acme");
    expect(update).not.toHaveBeenCalled();
  });

  it("is read-only for members", async () => {
    const { general, name, slug } = await renderSettings("open-source");

    expect(name).toBeDisabled();
    expect(slug).toBeDisabled();
    expect(
      general.getByText("Only owners and admins can change these."),
    ).toBeInTheDocument();
    expect(
      general.queryByRole("button", { name: "Update organization" }),
    ).toBeNull();
  });

  it("is linked from the sidebar", async () => {
    await renderRoute("/organizations/acme", getSession);

    expect(
      await screen.findByRole("link", { name: "Settings" }),
    ).toHaveAttribute("href", "/organizations/acme/settings");
  });
});
