import { render, screen, waitFor, within } from "@testing-library/react";
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
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
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

describe("DangerSection with typed confirmation", () => {
  function renderTyped(onConfirm = vi.fn()) {
    render(
      <DangerSection
        title="Destroy this app"
        description="Its deployments are torn down."
        actionLabel="Destroy app"
        confirmTitle="Destroy api?"
        confirmText="api"
        onConfirm={onConfirm}
      />,
    );
    return onConfirm;
  }

  async function open() {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Destroy app" }));
    const dialog = within(await screen.findByRole("alertdialog"));
    return {
      user,
      input: dialog.getByRole("textbox", { name: "Type api to confirm" }),
      destroy: dialog.getByRole("button", { name: "Destroy app" }),
    };
  }

  it("only allows confirming once the name is typed exactly", async () => {
    const onConfirm = renderTyped();
    const { user, input, destroy } = await open();
    expect(destroy).toBeDisabled();

    await user.type(input, "API");
    expect(destroy).toBeDisabled();

    await user.clear(input);
    await user.type(input, " api ");
    expect(destroy).toBeEnabled();

    await user.click(destroy);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("confirms with Enter once the name matches", async () => {
    const onConfirm = renderTyped();
    const { user, input } = await open();

    await user.type(input, "ap{Enter}");
    expect(onConfirm).not.toHaveBeenCalled();

    await user.type(input, "i{Enter}");
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("forgets what was typed when the dialog closes", async () => {
    renderTyped();
    const first = await open();
    await first.user.type(first.input, "api");
    await first.user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

    const second = await open();

    expect(second.input).toHaveValue("");
    expect(second.destroy).toBeDisabled();
  });
});
