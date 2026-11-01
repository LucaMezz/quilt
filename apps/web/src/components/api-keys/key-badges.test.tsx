import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExpiresSoonBadge, KeyStatusBadge } from "./key-badges";

describe("key badges", () => {
  it.each([
    ["Active", <KeyStatusBadge key="s" status="active" />],
    ["Expires soon", <ExpiresSoonBadge key="e" />],
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
