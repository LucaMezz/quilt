import { Button } from "@quilt/ui/components/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon } from "lucide-react";

import { SectionCard } from "./section-card";

const meta = {
  title: "web/settings/SectionCard",
  component: SectionCard,
  tags: ["autodocs"],
  args: {
    title: "Members",
    description: "People who can deploy and manage apps in this organization.",
    children: (
      <p className="text-muted-foreground text-sm">
        Section content goes here.
      </p>
    ),
  },
  argTypes: {
    action: { control: false },
    children: { control: false },
    level: { control: "inline-radio", options: [2, 3] },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A raised card for one section of a settings or detail page, labelled by its own heading so screen readers list it as a region. Put the section's main action in `action`, top right. Use `level={3}` when the page already has an `h2` above the sections, like a key's name on its detail page.",
      },
    },
  },
} satisfies Meta<typeof SectionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  parameters: { a11y: { test: "todo" } },
  args: {
    action: (
      <Button>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        Invite member
      </Button>
    ),
  },
};

export const HeaderOnly: Story = {
  args: {
    title: "Status",
    description:
      "Requests made with this key are accepted until it expires on 1 December 2026.",
    action: <Button variant="outline">Disable key</Button>,
    children: undefined,
    level: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Leave out `children` when the description and action say everything, like a key's status.",
      },
    },
  },
};

export const Destructive: Story = {
  args: {
    title: "Delete this key",
    description:
      "Anything using it stops working immediately. This can't be undone.",
    action: <Button variant="destructive">Delete key</Button>,
    children: undefined,
    className: "ring-destructive/30",
  },
  parameters: {
    a11y: { test: "todo" },
    docs: {
      description: {
        story:
          'Tint the ring with `className="ring-destructive/30"` for actions that can\'t be undone.',
      },
    },
  },
};
