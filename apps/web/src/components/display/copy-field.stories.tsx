import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { CopyField } from "./copy-field";

const meta = {
  title: "web/display/CopyField",
  component: CopyField,
  tags: ["autodocs"],
  args: {
    id: "app-url",
    label: "App URL",
    value: "https://api.acme.quilt.example",
    copyLabel: "Copy URL",
    copiedMessage: "Copied the URL",
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A read-only value people need to paste elsewhere, like an app URL, a CLI command or a new API key. Clicking or tabbing into it selects the whole value, and the button copies it and confirms with a toast. Name the button after the value in `copyLabel` ("Copy URL"), since its only visible content is an icon.',
      },
    },
  },
} satisfies Meta<typeof CopyField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    id: "login-command",
    label: "Sign in from your terminal",
    value: "quilt login",
    copyLabel: "Copy command",
    copiedMessage: "Copied the command",
    description: "Run it, then confirm the code in your browser.",
  },
};

export const Secret: Story = {
  args: {
    id: "new-key",
    label: "ci-deploy",
    value: "qk_9fQ2vXcL7mPzR4tY8wNbE1sKdJ6hGuA3",
    copyLabel: "Copy key",
    copiedMessage: "Copied the new key",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A secret shown once, like a new API key. Say nearby that it won't be shown again.",
      },
    },
  },
};

export const SelectsOnClick: Story = {
  name: "when clicked, selects the whole value",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole<HTMLInputElement>("textbox", {
      name: "App URL",
    });

    await userEvent.click(input);

    await expect(input.selectionStart).toBe(0);
    await expect(input.selectionEnd).toBe(args.value.length);
  },
};
