import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { ViewSwitcher } from "./view-switcher";
import type { View } from "./views";

function Switcher(props: React.ComponentProps<typeof ViewSwitcher>) {
  const [value, setValue] = useState<View>(props.value);
  return (
    <ViewSwitcher
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange(next);
      }}
    />
  );
}

const meta = {
  title: "web/collection/ViewSwitcher",
  component: ViewSwitcher,
  tags: ["autodocs"],
  args: {
    options: ["grid", "list", "table"],
    value: "grid",
    onValueChange: fn(),
  },
  argTypes: {
    value: { control: "inline-radio", options: ["grid", "list", "table"] },
  },
  render: (args) => <Switcher key={args.value} {...args} />,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lets people pick how a `Collection` shows its items. Offer only the views the page renders, in the order they should appear. Clicking the current view again keeps it selected, so a view is always chosen.",
      },
    },
  },
} satisfies Meta<typeof ViewSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllViews: Story = {};

export const TwoViews: Story = {
  args: { options: ["list", "table"], value: "list" },
  parameters: {
    docs: {
      description: {
        story:
          "A page that has no useful card design, like deployments, can leave out the grid.",
      },
    },
  },
};

export const SwitchesView: Story = {
  name: "when a view is clicked, reports it and marks it the only pressed view",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (name: string) => canvas.getByRole("button", { name });

    await userEvent.click(button("Table"));
    await expect(args.onValueChange).toHaveBeenCalledWith("table");
    await expect(button("Table")).toHaveAttribute("aria-pressed", "true");
    await expect(button("Grid")).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button("Table"));
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(button("Table")).toHaveAttribute("aria-pressed", "true");
  },
};
