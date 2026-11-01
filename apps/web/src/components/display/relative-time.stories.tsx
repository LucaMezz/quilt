import type { Meta, StoryObj } from "@storybook/react-vite";

import { RelativeTime } from "./relative-time";

const DAY = 24 * 60 * 60 * 1000;

const meta = {
  title: "web/display/RelativeTime",
  component: RelativeTime,
  tags: ["autodocs"],
  args: {
    date: new Date(Date.now() - 3 * DAY),
    fallback: "Never",
  },
  argTypes: {
    date: { control: "date" },
  },
  render: ({ date, fallback }) => (
    <RelativeTime
      date={date === null ? null : new Date(date)}
      fallback={fallback}
    />
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'A date as "3 days ago" or "in 2 months", in a `time` element whose tooltip and `datetime` give the exact moment. `fallback` replaces it, muted, when there\'s no date: say what that means, like "Never used" or "Never expires".',
      },
    },
  },
} satisfies Meta<typeof RelativeTime>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Past: Story = {};

export const Future: Story = {
  args: { date: new Date(Date.now() + 60 * DAY) },
};

export const NoDate: Story = {
  args: { date: null, fallback: "Never used" },
};
