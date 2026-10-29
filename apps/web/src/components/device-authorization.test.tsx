import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DeviceAuthorization } from "./device-authorization";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));

vi.mock("sonner", () => ({ toast: { error: toastError } }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

const onVerify = vi.fn();
const onApprove = vi.fn();
const onDeny = vi.fn();

function renderPage(initialCode?: string) {
  return render(
    <DeviceAuthorization
      initialCode={initialCode}
      onVerify={onVerify}
      onApprove={onApprove}
      onDeny={onDeny}
    />,
  );
}

describe("DeviceAuthorization", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    onVerify.mockResolvedValue({ clientId: "quilt CLI", scopes: [] });
  });

  it("rejects an incomplete code without verifying it", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Device code"), "wdjb");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText(
        "Enter the 8-character code shown in your terminal",
      ),
    ).toBeInTheDocument();
    expect(onVerify).not.toHaveBeenCalled();
  });

  it("normalizes a pasted code before verifying it", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByLabelText("Device code"));
    await user.paste("wdjb-mjht");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onVerify).toHaveBeenCalledWith("WDJBMJHT");
  });

  it("shows an error when the code is invalid or expired", async () => {
    onVerify.mockRejectedValue(new Error("invalid"));
    const user = userEvent.setup();
    renderPage("WDJBMJHT");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("This code is invalid or has expired"),
    ).toBeInTheDocument();
  });

  it("asks to confirm a prefilled code before approving", async () => {
    const user = userEvent.setup();
    renderPage("wdjbmjht");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("WDJB-MJHT")).toBeInTheDocument();
    expect(screen.getByText("quilt CLI")).toBeInTheDocument();
    expect(onApprove).not.toHaveBeenCalled();
  });

  it("approves the device", async () => {
    const user = userEvent.setup();
    renderPage("WDJBMJHT");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Approve" }));

    expect(onApprove).toHaveBeenCalledWith("WDJBMJHT");
    expect(await screen.findByText("Device connected")).toBeInTheDocument();
  });

  it("denies the device", async () => {
    const user = userEvent.setup();
    renderPage("WDJBMJHT");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Deny" }));

    expect(onDeny).toHaveBeenCalledWith("WDJBMJHT");
    expect(await screen.findByText("Request denied")).toBeInTheDocument();
    expect(onApprove).not.toHaveBeenCalled();
  });

  it("stays on the confirmation when approving fails", async () => {
    onApprove.mockRejectedValue(new Error("expired"));
    const user = userEvent.setup();
    renderPage("WDJBMJHT");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Approve" }));

    expect(toastError).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
  });

  it("goes back to code entry for a different code", async () => {
    const user = userEvent.setup();
    renderPage("WDJBMJHT");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(
      await screen.findByRole("button", { name: "Enter a different one" }),
    );

    expect(screen.getByLabelText("Device code")).toBeInTheDocument();
  });
});
