import { Field, FieldLabel } from "@quilt/ui/components/field";
import { Input } from "@quilt/ui/components/input";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { SectionCard } from "./section-card";
import { UpdateBar } from "./update-bar";

const meta = {
  title: "web/settings/UpdateBar",
  component: UpdateBar,
  tags: ["autodocs"],
  args: {
    changed: false,
    canUpdate: true,
    label: "Update permissions",
    onDiscard: fn(),
    onUpdate: fn(),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The footer of a section whose edits only apply when you confirm them. Both buttons stay disabled until something changes, then a note says there are unsaved changes. Pass `canUpdate={false}` while the draft is invalid. Name the button after what it applies, like "Update organization access", so it\'s clear which section it belongs to when a page has several.',
      },
    },
  },
} satisfies Meta<typeof UpdateBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchanged: Story = {};

export const Changed: Story = {
  args: { changed: true },
};

export const ChangedButInvalid: Story = {
  args: { changed: true, canUpdate: false },
  parameters: {
    docs: {
      description: {
        story:
          "The draft has changes but can't be applied yet, like organization access with no organization chosen. Show why next to the field, and Discard still works.",
      },
    },
  },
};

const original = "api";

function EditableSection({ onUpdate }: { onUpdate: (name: string) => void }) {
  const [saved, setSaved] = useState(original);
  const [draft, setDraft] = useState(original);
  const trimmed = draft.trim();

  return (
    <SectionCard
      title="App name"
      description="Used in the app's URL. Changes apply once you update."
    >
      <div className="flex flex-col gap-4">
        <Field className="max-w-sm">
          <FieldLabel htmlFor="app-name">Name</FieldLabel>
          <Input
            id="app-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </Field>
        <UpdateBar
          changed={trimmed !== saved}
          canUpdate={trimmed.length > 0}
          label="Update name"
          onDiscard={() => setDraft(saved)}
          onUpdate={() => {
            setSaved(trimmed);
            onUpdate(trimmed);
          }}
        />
      </div>
    </SectionCard>
  );
}

export const InASection: Story = {
  render: (args) => <EditableSection onUpdate={args.onUpdate} />,
  parameters: {
    docs: {
      description: {
        story:
          "How sections use it: keep a draft in state next to the saved value, compare them for `changed`, reset the draft on discard and save it on update. Remount the section with a `key` when the saved value can change from elsewhere.",
      },
    },
  },
};

export const DiscardsChanges: Story = {
  name: "when changes are discarded, restores the saved value",
  tags: ["!dev", "!autodocs"],
  render: InASection.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Name" });

    await userEvent.type(input, "-v2");
    await expect(canvas.getByText("You have unsaved changes.")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Discard" }));
    await expect(input).toHaveValue(original);
    await expect(
      canvas.getByRole("button", { name: "Discard" }),
    ).toBeDisabled();
  },
};

export const UpdatesChanges: Story = {
  name: "when changes are updated, saves them and settles",
  tags: ["!dev", "!autodocs"],
  render: InASection.render,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Name" });

    await userEvent.clear(input);
    await expect(
      canvas.getByRole("button", { name: "Update name" }),
    ).toBeDisabled();

    await userEvent.type(input, "web");
    await userEvent.click(canvas.getByRole("button", { name: "Update name" }));
    await expect(args.onUpdate).toHaveBeenCalledWith("web");
    await expect(canvas.queryByText("You have unsaved changes.")).toBeNull();
  },
};
