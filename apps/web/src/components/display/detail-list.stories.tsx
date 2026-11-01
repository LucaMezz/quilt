import type { Meta, StoryObj } from "@storybook/react-vite";
import { Detail, DetailList } from "./detail-list";
import { RelativeTime } from "./relative-time";
import { StatusBadge } from "./status-badge";

const meta = {
  title: "web/display/DetailList",
  component: DetailList,
  subcomponents: { Detail },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Read-only facts about one thing, as label and value pairs in a `dl`. Labels line up in one column however long they are, and long values like IDs wrap instead of overflowing. Values can be any element: code, a badge or a `RelativeTime`.",
      },
    },
  },
} satisfies Meta<typeof DetailList>;

export default meta;

type Story = StoryObj<typeof meta>;

const now = Date.now();

export const Default: Story = {
  args: {
    children: (
      <>
        <Detail label="Status">
          <StatusBadge tone="success">Ready</StatusBadge>
        </Detail>
        <Detail label="Region">London</Detail>
        <Detail label="Resources">4 CPUs · 16 GB memory</Detail>
        <Detail label="ID">
          <code className="break-all">srv_01JC9ZK4X7B2M8Q3T6V5N0P1RA</code>
        </Detail>
        <Detail label="Joined">
          <RelativeTime
            date={new Date(now - 12 * 24 * 60 * 60 * 1000)}
            fallback="Unknown"
          />
        </Detail>
        <Detail label="Last heartbeat">
          <RelativeTime date={null} fallback="Never" />
        </Detail>
      </>
    ),
  },
};
