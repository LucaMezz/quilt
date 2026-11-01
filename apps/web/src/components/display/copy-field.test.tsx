import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CopyField } from "./copy-field";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  toast.success.mockClear();
  toast.error.mockClear();
});

describe("CopyField", () => {
  it("shows the value read-only under its label", () => {
    render(
      <CopyField id="url" label="App URL" value="https://api.example.com" />,
    );

    const input = screen.getByRole("textbox", { name: "App URL" });
    expect(input).toHaveValue("https://api.example.com");
    expect(input).toHaveAttribute("readonly");
  });

  it("copies the value and confirms it", async () => {
    const user = userEvent.setup();
    render(
      <CopyField
        id="url"
        label="App URL"
        value="https://api.example.com"
        copyLabel="Copy URL"
        copiedMessage="Copied the URL"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy URL" }));

    await expect(navigator.clipboard.readText()).resolves.toBe(
      "https://api.example.com",
    );
    expect(toast.success).toHaveBeenCalledWith("Copied the URL");
  });

  it("explains how to copy by hand when the clipboard is blocked", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("denied"),
    );
    render(<CopyField id="url" label="App URL" value="x" />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Couldn't copy it. Select the text and copy it instead.",
    );
  });
});
