import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DangerSection } from "./danger-section";

function renderSection(onConfirm = vi.fn()) {
  render(
    <DangerSection
      title="Delete this organization"
      description="Its apps stop and its data is removed."
      actionLabel="Delete organization"
      confirmTitle="Delete Acme?"
      onConfirm={onConfirm}
    />,
  );
  return onConfirm;
}

describe("DangerSection", () => {
  it("asks for confirmation before acting", async () => {
    const user = userEvent.setup();
    const onConfirm = renderSection();

    await user.click(
      screen.getByRole("button", { name: "Delete organization" }),
    );

    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete Acme?",
    });
    expect(dialog).toHaveTextContent("Its apps stop and its data is removed.");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("acts once confirmed", async () => {
    const user = userEvent.setup();
    const onConfirm = renderSection();

    await user.click(
      screen.getByRole("button", { name: "Delete organization" }),
    );
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete organization" }),
    );

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("does nothing when cancelled", async () => {
    const user = userEvent.setup();
    const onConfirm = renderSection();

    await user.click(
      screen.getByRole("button", { name: "Delete organization" }),
    );
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
