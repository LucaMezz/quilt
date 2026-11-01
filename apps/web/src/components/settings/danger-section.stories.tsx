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
          "A section for an action that can't be undone, like deleting or leaving something. It sits last on the page, tinted red, and its button opens a dialog that asks again before `onConfirm` runs. Use the same verb for the button and the confirm button (\"Delete app\"), name the thing in `confirmTitle`, and say what's lost in the description. `confirmDescription` defaults to the description.",
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
