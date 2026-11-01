import type { Meta, StoryObj } from "@storybook/react-vite";
import z from "zod";

import type { TextareaField } from "./textarea-field";
import { useAppForm } from "./use-app-form";

type Props = React.ComponentProps<typeof TextareaField> & {
  initialValue?: string;
  error?: string;
};

function TextareaFieldStory({ initialValue = "", error, ...props }: Props) {
  const form = useAppForm({
    defaultValues: { value: initialValue },
    validators: error
      ? { onMount: z.object({ value: z.string().refine(() => false, error) }) }
      : {},
  });

  return (
    <form className="max-w-md" noValidate>
      <form.AppField name="value">
        {(field) => <field.TextareaField {...props} />}
      </form.AppField>
    </form>
  );
}

const meta = {
  title: "web/form/TextareaField",
  component: TextareaFieldStory,
  tags: ["autodocs"],
  args: { label: "Description", placeholder: "Optional" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          '`TextField` for longer text, like a description. Bound the same way: `<form.AppField name="…">{(field) => <field.TextareaField label="…" />}</form.AppField>`.',
      },
    },
  },
} satisfies Meta<typeof TextareaFieldStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "Shown to everyone in the organization." },
};

export const Invalid: Story = {
  args: {
    initialValue: "x".repeat(40),
    error: "Use 280 characters or fewer",
  },
};
