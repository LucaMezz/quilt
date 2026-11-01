import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Collection } from "./collection";
import type { Column } from "./collection-table";
import type { View } from "./views";

type Server = { id: string; name: string; cpus: number };

const servers: Server[] = [
  { id: "s1", name: "bravo", cpus: 8 },
  { id: "s2", name: "alpha", cpus: 2 },
  { id: "s3", name: "charlie", cpus: 4 },
];

const columns: Column<Server>[] = [
  {
    key: "name",
    header: "Name",
    rowHeader: true,
    cell: (server) => server.name,
    sortValue: (server) => server.name,
  },
  {
    key: "cpus",
    header: "CPUs",
    cell: (server) => server.cpus,
    sortValue: (server) => server.cpus,
  },
  { key: "id", header: "ID", cell: (server) => server.id },
];

function renderCollection(
  view: View,
  props: Partial<React.ComponentProps<typeof Collection<Server>>> = {},
) {
  return render(
    <Collection
      view={view}
      label="Servers"
      items={servers}
      getKey={(server) => server.id}
      empty={<p>No servers</p>}
      grid={(server) => <span>card {server.name}</span>}
      list={(server) => <span>row {server.name}</span>}
      table={columns}
      {...props}
    />,
  );
}

function rowHeaders() {
  return screen.getAllByRole("rowheader").map((cell) => cell.textContent);
}

describe("Collection", () => {
  it.each([
    ["grid", "card bravo"],
    ["list", "row bravo"],
  ] as const)("renders each item in the %s view", (view, text) => {
    renderCollection(view);

    const list = screen.getByRole("list", { name: "Servers" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText(text)).toBeInTheDocument();
  });

  it("renders a column per field in the table view", () => {
    renderCollection("table");

    const table = screen.getByRole("table", { name: "Servers" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(rowHeaders()).toEqual(["bravo", "alpha", "charlie"]);
  });

  it("sorts by a column, ascending then descending", async () => {
    const user = userEvent.setup();
    renderCollection("table");

    await user.click(screen.getByRole("button", { name: "CPUs" }));
    expect(rowHeaders()).toEqual(["alpha", "charlie", "bravo"]);
    expect(screen.getByRole("columnheader", { name: "CPUs" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );

    await user.click(screen.getByRole("button", { name: "CPUs" }));
    expect(rowHeaders()).toEqual(["bravo", "charlie", "alpha"]);
    expect(screen.getByRole("columnheader", { name: "CPUs" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("sorts text columns alphabetically", async () => {
    const user = userEvent.setup();
    renderCollection("table");

    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(rowHeaders()).toEqual(["alpha", "bravo", "charlie"]);
  });

  it("leaves columns without a sort value as plain headers", () => {
    renderCollection("table");

    expect(screen.queryByRole("button", { name: "ID" })).toBeNull();
  });

  it("shows the empty state when there are no items", () => {
    renderCollection("grid", { items: [] });

    expect(screen.getByText("No servers")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("falls back to another view when the page doesn't offer the chosen one", () => {
    renderCollection("table", { table: undefined, grid: undefined });

    expect(screen.getByText("row alpha")).toBeInTheDocument();
  });
});
