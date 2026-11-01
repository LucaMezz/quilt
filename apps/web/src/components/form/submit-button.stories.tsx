import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { useAppForm } from "./use-app-form";

function SubmitButtonStory({
  label,
  pending,
  delay,
}: {
  label: string;
  pending: string;
  delay: number;
}) {
  const form = useAppForm({
    defaultValues: {},
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, delay)),
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <form.SubmitButton pending={pending}>{label}</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

const meta = {
  title: "web/form/SubmitButton",
  component: SubmitButtonStory,
  tags: ["autodocs"],
  args: {
    label: "Create account",
    pending: "Creating account...",
    delay: 1500,
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The submit button for a `useAppForm` form, rendered inside `<form.AppForm>`. It's disabled while the form can't submit (after a failed validation, until the problem is fixed) and while submitting, when it shows `pending` instead. Use a verb for the label and the same verb in the \"-ing\" form for `pending`. Click it here to see the pending state; `delay` is how long the story's submit takes.",
      },
    },
  },
} satisfies Meta<typeof SubmitButtonStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { parameters: { a11y: { test: "todo" } } };

export const ShowsPending: Story = {
  parameters: { a11y: { test: "todo" } },
  name: "while submitting, shows the pending label and disables",
  tags: ["!dev", "!autodocs"],
  args: { delay: 800 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Create account" }),
    );

    const pending = await canvas.findByRole("button", {
      name: "Creating account...",
    });
    await expect(pending).toBeDisabled();
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Create account" }),
      ).toBeEnabled(),
    );
  },
};
