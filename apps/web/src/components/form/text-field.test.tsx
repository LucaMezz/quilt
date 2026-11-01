import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import z from "zod";

import { useAppForm } from "./use-app-form";

function Harness({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (name: string) => void;
}) {
  const form = useAppForm({
    defaultValues: { name: "", bio: "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Enter a name"),
        bio: z.string(),
      }),
    },
    onSubmit: ({ value }) => onSubmit(value.name),
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField label="Name" description="Shown to your team." />
        )}
      </form.AppField>
      <form.AppField name="bio">
        {(field) => <field.TextareaField label="Bio" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton pending="Saving...">Save</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

describe("form fields", () => {
  it("labels and describes each field", () => {
    render(<Harness />);

    expect(
      screen.getByRole("textbox", { name: "Name" }),
    ).toHaveAccessibleDescription("Shown to your team.");
    expect(screen.getByRole("textbox", { name: "Bio" })).toBeInTheDocument();
  });

  it("marks a field invalid and shows why after a failed submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Enter a name")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Shown to your team. Enter a name",
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits what was typed once valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith("Ada");
  });
});
