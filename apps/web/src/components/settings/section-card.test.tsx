import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionCard } from "./section-card";

describe("SectionCard", () => {
  it("is a region named by its heading, at the level asked for", () => {
    render(
      <SectionCard
        level={3}
        title="Permissions"
        action={<button type="button">Edit</button>}
      >
        <p>Body</p>
      </SectionCard>,
    );

    const region = screen.getByRole("region", { name: "Permissions" });
    expect(
      screen.getByRole("heading", { level: 3, name: "Permissions" }),
    ).toBeInTheDocument();
    expect(region).toContainElement(
      screen.getByRole("button", { name: "Edit" }),
    );
    expect(region).toHaveTextContent("Body");
  });
});
