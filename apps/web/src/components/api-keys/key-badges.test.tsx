import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccessBadge, ExpiresSoonBadge, StatusBadge } from "./key-badges";

describe("key badges", () => {
  it.each([
    ["Active", <StatusBadge key="s" status="active" />],
    ["Expires soon", <ExpiresSoonBadge key="e" />],
    ["Read and write", <AccessBadge key="a" level="write" />],
  ])(
    "gives %s an icon the badge can size, hidden from screen readers",
    (label, badge) => {
      render(badge);

      const icon = screen.getByText(label).querySelector(":scope > svg");
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    },
  );
});
