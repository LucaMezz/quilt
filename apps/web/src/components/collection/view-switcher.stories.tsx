import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { ViewSwitcher } from "./view-switcher";
import type { View } from "./views";

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
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <ViewSwitcher
        {...args}
        onValueChange={(value: View) => {
          args.onValueChange(value);
          updateArgs({ value });
        }}
      />
    );
  },
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
  name: "when a view is clicked, marks it as the only pressed view",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (name: string) => canvas.getByRole("button", { name });

    await userEvent.click(button("Table"));
    await waitFor(() =>
      expect(button("Table")).toHaveAttribute("aria-pressed", "true"),
    );
    await expect(button("Grid")).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button("Table"));
    await expect(button("Table")).toHaveAttribute("aria-pressed", "true");
  },
};
