import { Button } from "@quilt/ui/components/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon } from "lucide-react";

import { ViewSwitcher } from "@/components/collection/view-switcher";

import { PageHeader } from "./page-header";

const meta = {
  title: "web/app/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Organizations",
    description:
      "Each organization has its own apps, servers and members. Open one to manage it.",
  },
  argTypes: {
    actions: { control: false },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The page's `h1`, a one-line description and the page's main actions. Every page in an app shell starts with one. Actions wrap below the title on narrow screens.",
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleAndDescription: Story = {};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <ViewSwitcher
          options={["grid", "list", "table"]}
          value="grid"
          onValueChange={() => {}}
        />
        <Button>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          New organization
        </Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A collection page: the view switcher, then the primary action last so it sits on the right edge.",
      },
    },
  },
};

export const TitleOnly: Story = {
  args: { title: "Account", description: undefined },
};
