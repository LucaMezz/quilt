import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { EditableText } from "./editable-text";

type Props = Omit<React.ComponentProps<typeof EditableText>, "children"> & {
  as: "heading" | "paragraph";
};

function EditableTextStory({ as, value: initial, onSave, ...props }: Props) {
  const [value, setValue] = useState(initial);
  const text =
    as === "heading" ? (
      <h2 className="font-semibold text-xl">{value}</h2>
    ) : (
      <p className="text-muted-foreground">{value}</p>
    );

  return (
    <div className="flex max-w-2xl flex-wrap items-center gap-2">
      <EditableText
        {...props}
        value={value}
        onSave={(next) => {
          setValue(next);
          onSave(next);
        }}
      >
        {text}
      </EditableText>
    </div>
  );
}

const meta = {
  title: "web/form/EditableText",
  component: EditableTextStory,
  tags: ["autodocs"],
  args: {
    as: "heading",
    label: "Name",
    value: "deploy-bot",
    validate: (name: string) => (name ? undefined : "Give the key a name"),
    className: "max-w-md font-semibold md:text-xl",
    onSave: fn(),
  },
  argTypes: {
    as: { control: "inline-radio", options: ["heading", "paragraph"] },
    validate: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Edits a short piece of text in place, like a name or a description, without an Update and Discard bar. Pass the text as it normally looks (`children`); a pencil button next to it swaps in an input. Enter or clicking away saves the trimmed text through `onSave` (only if it changed), Escape puts the original back, and focus returns to the pencil. `validate` returns a problem to show: Enter keeps you editing, clicking away drops the edit. With an empty `value` and an `addLabel` it shows an add button instead. Use it for low-stakes text only; settings that change what something can do belong in a section with `UpdateBar`. The component renders a fragment, so put it in a flex row next to what should sit beside the text, like badges. `as` exists only for these stories.",
      },
    },
  },
} satisfies Meta<typeof EditableTextStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Heading: Story = {};

export const Paragraph: Story = {
  args: {
    as: "paragraph",
    label: "Description",
    value: "Deploys apps from the main branch of the website repo.",
    multiline: true,
    validate: undefined,
    className: "max-w-2xl",
  },
};

export const Empty: Story = {
  args: {
    as: "paragraph",
    label: "Description",
    value: "",
    addLabel: "Add a description",
    multiline: true,
    validate: undefined,
    className: "max-w-2xl",
  },
};

export const SavesOnEnter: Story = {
  name: "when edited and Enter is pressed, saves the new text",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Edit name" }));
    await userEvent.keyboard("ci-bot{Enter}");

    await expect(args.onSave).toHaveBeenCalledWith("ci-bot");
    await expect(canvas.getByRole("heading", { name: "ci-bot" })).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Edit name" }),
    ).toHaveFocus();
  },
};

export const CancelsOnEscape: Story = {
  name: "when Escape is pressed, keeps the original text",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Edit name" }));
    await userEvent.keyboard("something else{Escape}");

    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(
      canvas.getByRole("heading", { name: "deploy-bot" }),
    ).toBeVisible();
  },
};

export const RejectsEmpty: Story = {
  name: "when emptied and Enter is pressed, explains and keeps editing",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Edit name" }));
    await userEvent.keyboard("{Backspace}{Enter}");

    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(canvas.getByText("Give the key a name")).toBeVisible();
  },
};
