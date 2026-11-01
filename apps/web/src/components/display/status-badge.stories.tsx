import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClockAlertIcon, LoaderCircleIcon, MoonIcon } from "lucide-react";

import { StatusBadge } from "./status-badge";

const meta = {
  title: "web/display/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: { tone: "success", children: "Running" },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["success", "neutral", "warning", "danger"],
    },
    icon: { control: false },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Shows the state of something, like an app, a server or an API key. Map each state to one of four tones rather than styling badges directly, so a state that needs attention looks the same everywhere. Each tone has a default icon; pass `icon` when a more specific one helps. The icon is hidden from screen readers, so the label must say everything.",
      },
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Neutral: Story = {
  args: { tone: "neutral", children: "Stopped" },
};

export const Warning: Story = {
  args: { tone: "warning", children: "Degraded" },
};

export const Danger: Story = {
  parameters: { a11y: { test: "todo" } },
  args: { tone: "danger", children: "Failed" },
};

export const AllTones: Story = {
  parameters: { a11y: { test: "todo" } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge tone="success">Running</StatusBadge>
      <StatusBadge tone="neutral">Stopped</StatusBadge>
      <StatusBadge tone="warning">Degraded</StatusBadge>
      <StatusBadge tone="danger">Failed</StatusBadge>
    </div>
  ),
};

export const WithSpecificIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge tone="neutral" icon={<MoonIcon />}>
        Sleeping
      </StatusBadge>
      <StatusBadge
        tone="neutral"
        icon={<LoaderCircleIcon className="animate-spin" />}
      >
        Deploying
      </StatusBadge>
      <StatusBadge tone="warning" icon={<ClockAlertIcon />}>
        Expires soon
      </StatusBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A specific icon tells states with the same tone apart at a glance. Classes on your icon are kept, so it can animate.",
      },
    },
  },
};
