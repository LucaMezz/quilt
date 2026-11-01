import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelativeTime } from "./relative-time";

describe("RelativeTime", () => {
  it("shows how long ago, with the exact time in the markup", () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    render(<RelativeTime date={date} fallback="Never" />);

    const time = screen.getByText("3 days ago");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", date.toISOString());
  });

  it("shows the fallback when there is no date", () => {
    render(<RelativeTime date={null} fallback="Never used" />);

    expect(screen.getByText("Never used")).toBeInTheDocument();
  });
});
