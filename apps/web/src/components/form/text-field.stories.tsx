import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import z from "zod";

import type { TextField } from "./text-field";
import { useAppForm } from "./use-app-form";

type Props = React.ComponentProps<typeof TextField> & {
  initialValue?: string;
  error?: string;
};

function TextFieldStory({ initialValue = "", error, ...props }: Props) {
  const form = useAppForm({
    defaultValues: { value: initialValue },
    validators: error
      ? { onMount: z.object({ value: z.string().refine(() => false, error) }) }
      : {},
  });

  return (
    <form className="max-w-sm" noValidate>
      <form.AppField name="value">
        {(field) => <field.TextField {...props} />}
      </form.AppField>
    </form>
  );
}

const meta = {
  title: "web/form/TextField",
  component: TextFieldStory,
  tags: ["autodocs"],
  args: {
    label: "App name",
    placeholder: "e.g. api",
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A labelled text input bound to a TanStack Form field. Create forms with `useAppForm` from `@/components/form/use-app-form`, then render `<form.AppField name="…">{(field) => <field.TextField label="…" />}</form.AppField>`. The field supplies the value, blur and change handlers, `aria-invalid` and the error messages, so pass only what describes the input: `label`, `description`, `type`, `autoComplete`, `placeholder`. `id` defaults to the field\'s name. The stories wrap it in a one-field form; `initialValue` and `error` exist only for them.',
      },
    },
  },
} satisfies Meta<typeof TextFieldStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    description:
      "Lowercase letters, numbers and dashes. Used in the app's URL.",
  },
};

export const Invalid: Story = {
  args: {
    initialValue: "My App!",
    error: "Use lowercase letters, numbers and dashes",
  },
  parameters: {
    a11y: { test: "todo" },
    docs: {
      description: {
        story:
          "Errors from the form's validators appear under the input, which is marked `aria-invalid` and tinted. In real forms they usually appear after the first submit.",
      },
    },
  },
};

export const HiddenLabel: Story = {
  args: {
    label: "Name",
    hideLabel: true,
    initialValue: "Ada Lovelace",
    description: "64 characters maximum.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When a section's heading already names the field, `hideLabel` keeps the label for screen readers only.",
      },
    },
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: undefined,
    description: "Must be at least 8 characters long.",
  },
};

export const Disabled: Story = {
  args: { initialValue: "api", disabled: true },
};

export const Types: Story = {
  name: "when typed into, updates the field",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "App name" });

    await userEvent.type(input, "web");

    await expect(input).toHaveValue("web");
  },
};
