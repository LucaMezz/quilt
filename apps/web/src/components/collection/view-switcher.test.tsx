import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ViewSwitcher } from "./view-switcher";
import { viewSearch } from "./views";

describe("ViewSwitcher", () => {
  it("offers only the given views and marks the current one", () => {
    render(
      <ViewSwitcher
        options={["grid", "table"]}
        value="table"
        onValueChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByRole("button", { name: "List" })).toBeNull();
  });

  it("reports the view you pick", async () => {
    const onValueChange = vi.fn();
    render(
      <ViewSwitcher
        options={["grid", "list"]}
        value="grid"
        onValueChange={onValueChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "List" }));

    expect(onValueChange).toHaveBeenCalledWith("list");
  });

  it("keeps a view chosen when you click the current one again", async () => {
    const onValueChange = vi.fn();
    render(
      <ViewSwitcher
        options={["grid", "list"]}
        value="grid"
        onValueChange={onValueChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Grid" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("viewSearch", () => {
  it.each([
    [{ view: "list" }, "list"],
    [{ view: "kanban" }, undefined],
    [{}, undefined],
  ])("reads %o as %s", (search, view) => {
    expect(viewSearch.parse(search).view).toBe(view);
  });
});
