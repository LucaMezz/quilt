import { render, screen } from "@testing-library/react";
import { MoonIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status-badge";

function iconOf(label: string) {
  return screen.getByText(label).querySelector(":scope > svg");
}

describe("StatusBadge", () => {
  it.each(["success", "neutral", "warning", "danger"] as const)(
    "gives the %s tone a default icon hidden from screen readers",
    (tone) => {
      render(<StatusBadge tone={tone}>Label</StatusBadge>);

      expect(iconOf("Label")).toHaveAttribute("aria-hidden", "true");
    },
  );

  it("uses your icon instead, keeping its classes", () => {
    render(
      <StatusBadge tone="neutral" icon={<MoonIcon className="custom" />}>
        Sleeping
      </StatusBadge>,
    );

    const icon = iconOf("Sleeping");
    expect(icon).toHaveClass("lucide-moon", "custom");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
