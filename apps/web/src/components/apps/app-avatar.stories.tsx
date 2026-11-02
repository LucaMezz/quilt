import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppAvatar } from "./app-summary";

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#7c3aed"/><circle cx="40" cy="40" r="22" fill="#fff"/></svg>',
)}`;

const meta = {
  title: "web/apps/AppAvatar",
  component: AppAvatar,
  tags: ["autodocs"],
  args: {
    app: { name: "api", logo: null },
  },
  argTypes: {
    size: { control: "inline-radio", options: [undefined, "lg"] },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An app's logo, or the first letter of its name until it has one. It's decorative (`aria-hidden`), so always show the name next to it.",
      },
    },
  },
} satisfies Meta<typeof AppAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const Logo: Story = {
  args: { app: { name: "api", logo: LOGO } },
};

export const Large: Story = {
  args: { app: { name: "api", logo: LOGO }, size: "lg" },
};
