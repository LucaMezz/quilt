import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditableText } from "./editable-text";

function renderName(value = "deploy-bot") {
  const onSave = vi.fn();
  render(
    <div>
      <EditableText
        label="Name"
        value={value}
        validate={(name) => (name ? undefined : "Give it a name")}
        onSave={onSave}
      >
        <h2>{value}</h2>
      </EditableText>
      <button type="button">Elsewhere</button>
    </div>,
  );
  return onSave;
}

async function startEditing() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Edit name" }));
  return { user, input: screen.getByRole("textbox", { name: "Name" }) };
}

describe("EditableText", () => {
  it("shows the text with an edit button", () => {
    renderName();

    expect(screen.getByRole("heading", { name: "deploy-bot" })).toBeVisible();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("edits the current text, focused and selected", async () => {
    renderName();
    const { input } = await startEditing();

    expect(input).toHaveValue("deploy-bot");
    expect(input).toHaveFocus();
    expect((input as HTMLInputElement).selectionEnd).toBe("deploy-bot".length);
  });

  it("saves the trimmed text on Enter and returns focus", async () => {
    const onSave = renderName();
    const { user, input } = await startEditing();

    await user.clear(input);
    await user.type(input, "  ci-bot {Enter}");

    expect(onSave).toHaveBeenCalledWith("ci-bot");
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("button", { name: "Edit name" })).toHaveFocus();
  });

  it("saves when you click away", async () => {
    const onSave = renderName();
    const { user, input } = await startEditing();

    await user.clear(input);
    await user.type(input, "ci-bot");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(onSave).toHaveBeenCalledWith("ci-bot");
  });

  it("puts the original back on Escape", async () => {
    const onSave = renderName();
    const { user, input } = await startEditing();

    await user.type(input, "-changed{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "deploy-bot" })).toBeVisible();
  });

  it("doesn't save when nothing changed", async () => {
    const onSave = renderName();
    const { user } = await startEditing();

    await user.keyboard("{Enter}");

    expect(onSave).not.toHaveBeenCalled();
  });

  it("explains invalid text on Enter and keeps you editing", async () => {
    const onSave = renderName();
    const { user, input } = await startEditing();

    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(onSave).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Give it a name");
  });

  it("drops invalid text when you click away", async () => {
    const onSave = renderName();
    const { user, input } = await startEditing();

    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "deploy-bot" })).toBeVisible();
  });

  it("offers to add text when there is none", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditableText
        label="Description"
        value=""
        addLabel="Add a description"
        multiline
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add a description" }));
    await user.type(
      screen.getByRole("textbox", { name: "Description" }),
      "Line one{Shift>}{Enter}{/Shift}line two{Enter}",
    );

    expect(onSave).toHaveBeenCalledWith("Line one\nline two");
  });
});
