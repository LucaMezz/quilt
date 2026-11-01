import { Button } from "@quilt/ui/components/button";
import { Card } from "@quilt/ui/components/card";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon, ServerIcon } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { StatusBadge } from "@/components/display/status-badge";

import { Collection } from "./collection";
import { CollectionEmpty } from "./collection-empty";
import type { Column } from "./collection-table";
import { ViewSwitcher } from "./view-switcher";
import type { View } from "./views";

type Server = {
  id: string;
  name: string;
  region: string;
  cpus: number;
  memoryGb: number;
  status: "Ready" | "Draining";
};

const servers: Server[] = [
  {
    id: "srv_1",
    name: "hetzner-fsn-1",
    region: "Falkenstein",
    cpus: 8,
    memoryGb: 32,
    status: "Ready",
  },
  {
    id: "srv_2",
    name: "home-lab",
    region: "London",
    cpus: 4,
    memoryGb: 16,
    status: "Ready",
  },
  {
    id: "srv_3",
    name: "ovh-gra-2",
    region: "Gravelines",
    cpus: 16,
    memoryGb: 64,
    status: "Draining",
  },
  {
    id: "srv_4",
    name: "raspberry-pi",
    region: "London",
    cpus: 4,
    memoryGb: 8,
    status: "Ready",
  },
];

function ServerStatus({ status }: { status: Server["status"] }) {
  return (
    <StatusBadge tone={status === "Ready" ? "success" : "warning"}>
      {status}
    </StatusBadge>
  );
}

function ServerCard({ server }: { server: Server }) {
  return (
    <Card className="h-full gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium text-sm">{server.name}</span>
        <ServerStatus status={server.status} />
      </div>
      <p className="text-muted-foreground text-sm">
        {server.region} · {server.cpus} CPUs · {server.memoryGb} GB
      </p>
    </Card>
  );
}

function ServerRow({ server }: { server: Server }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-sm">
      <div className="flex flex-1 flex-col">
        <span className="font-medium">{server.name}</span>
        <span className="text-muted-foreground">
          {server.region} · {server.cpus} CPUs · {server.memoryGb} GB
        </span>
      </div>
      <ServerStatus status={server.status} />
    </div>
  );
}

const columns: Column<Server>[] = [
  {
    key: "name",
    header: "Name",
    rowHeader: true,
    sortValue: (server) => server.name,
    cell: (server) => <span className="font-medium">{server.name}</span>,
  },
  {
    key: "region",
    header: "Region",
    sortValue: (server) => server.region,
    cell: (server) => server.region,
  },
  {
    key: "cpus",
    header: "CPUs",
    sortValue: (server) => server.cpus,
    cell: (server) => server.cpus,
  },
  {
    key: "memory",
    header: "Memory",
    sortValue: (server) => server.memoryGb,
    cell: (server) => `${server.memoryGb} GB`,
  },
  {
    key: "status",
    header: "Status",
    cell: (server) => <ServerStatus status={server.status} />,
  },
];

const emptyState = (
  <CollectionEmpty
    icon={<ServerIcon />}
    title="No servers yet"
    description="Add a server and quilt will start placing apps on it."
    action={
      <Button>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        Add server
      </Button>
    }
  />
);

const meta = {
  title: "web/collection/Collection",
  component: Collection<Server>,
  tags: ["autodocs"],
  args: {
    view: "grid",
    label: "Servers",
    items: servers,
    getKey: (server) => server.id,
    empty: emptyState,
    grid: (server) => <ServerCard server={server} />,
    list: (server) => <ServerRow server={server} />,
    table: columns,
  },
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["grid", "list", "table"],
      table: { type: { summary: '"grid" | "list" | "table"' } },
    },
    items: { control: false, table: { type: { summary: "readonly T[]" } } },
    getKey: { control: false },
    empty: { control: false },
    grid: { control: false },
    list: { control: false },
    table: {
      control: false,
      table: { type: { summary: "readonly Column<T>[]" } },
    },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shows a page's items as a grid of cards, a list of rows or a sortable table. Pass the items once, then describe one item for each view the page offers: `grid` and `list` take a render function, `table` takes columns. If the chosen view isn't offered it falls back to grid, then list. With no items it renders `empty` instead. Keep the view in the URL with `viewSearch` and let people change it with `ViewSwitcher`.",
      },
    },
  },
} satisfies Meta<typeof Collection<Server>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Cards in up to three columns. Suits things people recognise at a glance, like organizations or servers.",
      },
    },
  },
};

export const List: Story = {
  args: { view: "list" },
  parameters: {
    docs: {
      description: {
        story:
          "One full-width row per item in a single bordered card. Suits a title, a line of details and a status, like deployments or activity.",
      },
    },
  },
};

export const Table: Story = {
  args: { view: "table" },
  parameters: {
    docs: {
      description: {
        story:
          "One column per field. Columns with a `sortValue` sort when you click their header, ascending then descending. Mark the identifying column `rowHeader` so screen readers announce it for each row, and put the item's link there.",
      },
    },
  },
};

export const Empty: Story = {
  args: { items: [] },
  parameters: {
    a11y: { test: "todo" },
    docs: {
      description: {
        story:
          "With no items the page's `empty` element replaces the whole collection, usually a `CollectionEmpty` with a way to create the first item.",
      },
    },
  },
};

export const SortsByColumn: Story = {
  name: "when a column header is clicked, sorts by that column",
  tags: ["!dev", "!autodocs"],
  args: { view: "table" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () =>
      canvas.getAllByRole("rowheader").map((cell) => cell.textContent);

    await userEvent.click(canvas.getByRole("button", { name: "CPUs" }));
    await expect(names()).toEqual([
      "home-lab",
      "raspberry-pi",
      "hetzner-fsn-1",
      "ovh-gra-2",
    ]);

    await userEvent.click(canvas.getByRole("button", { name: "CPUs" }));
    await expect(names()[0]).toBe("ovh-gra-2");
  },
};

function SwitchableServers() {
  const [view, setView] = useState<View>("grid");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ViewSwitcher
          options={["grid", "list", "table"]}
          value={view}
          onValueChange={setView}
        />
      </div>
      <Collection
        view={view}
        label="Servers"
        items={servers}
        getKey={(server) => server.id}
        empty={emptyState}
        grid={(server) => <ServerCard server={server} />}
        list={(server) => <ServerRow server={server} />}
        table={columns}
      />
    </div>
  );
}

export const WithViewSwitcher: Story = {
  render: () => <SwitchableServers />,
  parameters: {
    docs: {
      description: {
        story:
          "How a page puts the pieces together. Pages keep the view in the URL instead of state: add `validateSearch: viewSearch` to the route, read it with `Route.useSearch()` and navigate with `replace: true` when it changes.",
      },
    },
  },
};
