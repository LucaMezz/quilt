import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrganizationAvatar } from "./organization-avatar";

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#047857"/><path d="M20 20h40v40H20z" fill="#fff"/></svg>',
)}`;

const meta = {
  title: "web/organizations/OrganizationAvatar",
  component: OrganizationAvatar,
  tags: ["autodocs"],
  args: {
    organization: { name: "Acme", logo: null },
  },
  argTypes: {
    size: { control: "inline-radio", options: [undefined, "sm", "lg"] },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An organization's logo, or the first letter of its name until it has one. It's decorative (`aria-hidden`), so always show the name next to it.",
      },
    },
  },
} satisfies Meta<typeof OrganizationAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const Logo: Story = {
  args: { organization: { name: "Acme", logo: LOGO } },
};

export const Large: Story = {
  args: { organization: { name: "Acme", logo: LOGO }, size: "lg" },
};
