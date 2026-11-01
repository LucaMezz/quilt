import { Button } from "@quilt/ui/components/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2Icon, PlusIcon, RocketIcon } from "lucide-react";

import { CollectionEmpty } from "./collection-empty";

const meta = {
  title: "web/collection/CollectionEmpty",
  component: CollectionEmpty,
  tags: ["autodocs"],
  args: {
    icon: <Building2Icon />,
    title: "No organizations yet",
    description:
      "Organizations hold your apps, servers and members. Create one to get started.",
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The dashed box a `Collection` shows when it has no items. Say what would be here and why it matters, and give a way to create the first item when the person can.",
      },
    },
  },
} satisfies Meta<typeof CollectionEmpty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAction: Story = {
  parameters: { a11y: { test: "todo" } },
  args: {
    action: (
      <Button>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        New organization
      </Button>
    ),
  },
};

export const WithoutAction: Story = {
  args: {
    icon: <RocketIcon />,
    title: "No deployments yet",
    description: "Deployments appear here once you push your first app.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Leave out `action` when there's nothing to do from here, or the person isn't allowed to create items.",
      },
    },
  },
};
