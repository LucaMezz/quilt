import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, within } from "storybook/test";

import { DangerSection } from "./danger-section";

const meta = {
  title: "web/settings/DangerSection",
  component: DangerSection,
  tags: ["autodocs"],
  args: {
    title: "Delete this app",
    description:
      "Its deployments, domains and logs are removed. This can't be undone.",
    actionLabel: "Delete app",
    confirmTitle: "Delete api?",
    onConfirm: fn(),
  },
  argTypes: {
    level: { control: "inline-radio", options: [2, 3] },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A section for an action that can't be undone, like deleting or leaving something. It sits last on the page, tinted red, and its button opens a dialog that asks again before `onConfirm` runs. Use the same verb for the button and the confirm button (\"Delete app\"), name the thing in `confirmTitle`, and say what's lost in the description. `confirmDescription` defaults to the description. For the most destructive actions, set `confirmText` to the thing's name: the confirm button stays disabled until it's typed exactly, as the CLI asks.",
      },
    },
  },
} satisfies Meta<typeof DangerSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Leave: Story = {
  args: {
    title: "Leave this organization",
    description:
      "You lose access to its apps and servers until someone invites you again.",
    actionLabel: "Leave organization",
    confirmTitle: "Leave Acme?",
  },
};

export const TypedConfirmation: Story = {
  args: {
    title: "Destroy this app",
    description:
      "Its deployments are torn down and its hostname stops answering. This can't be undone.",
    actionLabel: "Destroy app",
    confirmTitle: "Destroy api?",
    confirmText: "api",
  },
  parameters: {
    docs: {
      description: {
        story:
          "With `confirmText`, the dialog asks you to type the name before the action is allowed.",
      },
    },
  },
};

export const ConfirmsByTyping: Story = {
  ...TypedConfirmation,
  name: "with confirmText, runs the action only once the name is typed",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Destroy app" }));
    const dialog = within(
      await screen.findByRole("alertdialog", { name: "Destroy api?" }),
    );
    const destroy = dialog.getByRole("button", { name: "Destroy app" });
    const input = dialog.getByRole("textbox", { name: "Type api to confirm" });
    await expect(destroy).toBeDisabled();

    await userEvent.type(input, "ap");
    await expect(destroy).toBeDisabled();

    await userEvent.type(input, "i");
    await userEvent.click(destroy);
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

export const Confirms: Story = {
  name: "when confirmed in the dialog, runs the action",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Delete app" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete api?",
    });
    await expect(args.onConfirm).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete app" }),
    );
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

export const Cancels: Story = {
  name: "when cancelled, does nothing",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Delete app" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Cancel" }),
    );

    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
