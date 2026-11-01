import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type Profile,
  useProfile,
  useSetProfileImage,
  useUpdateProfileName,
} from "@/lib/profile/use-profile";
import { renderRoute } from "@/test/render-route";

const { getSession, setImage, updateName, toastSuccess } = vi.hoisted(() => ({
  getSession: vi.fn(),
  setImage: vi.fn(),
  updateName: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getSession } }));
vi.mock("@/lib/profile/use-profile");
vi.mock("sonner", async (importOriginal) => ({
  ...(await importOriginal<typeof import("sonner")>()),
  toast: { success: toastSuccess },
}));

const ada: Profile = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  image: null,
};

function showProfile(profile: Profile) {
  vi.mocked(useProfile).mockReturnValue(profile);
}

async function renderProfile() {
  await renderRoute("/account", getSession);
  return screen.findByRole("region", { name: "Profile picture" });
}

beforeEach(() => {
  showProfile(ada);
  vi.mocked(useSetProfileImage).mockReturnValue(setImage);
  vi.mocked(useUpdateProfileName).mockReturnValue(updateName);
});

describe("profile picture", () => {
  it("shows your initials, name and email without a picture", async () => {
    const card = within(await renderProfile());

    expect(card.getByText("AL")).toBeInTheDocument();
    expect(card.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(card.getByText("ada@example.com")).toBeInTheDocument();
    expect(card.queryByRole("button", { name: "Remove" })).toBeNull();
  });

  it("uses a chosen PNG, JPEG or WebP image", async () => {
    const user = userEvent.setup();
    await renderProfile();
    const picture = new File(["png"], "me.png", { type: "image/png" });

    await user.upload(
      screen.getByLabelText(/^Choose a new profile picture/),
      picture,
    );

    expect(setImage).toHaveBeenCalledWith(picture);
    expect(toastSuccess).toHaveBeenCalledWith("Profile picture updated");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it.each([
    [
      new File(["gif"], "me.gif", { type: "image/gif" }),
      "Choose a PNG, JPEG or WebP image.",
    ],
    [
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "huge.png", {
        type: "image/png",
      }),
      "Choose an image of 5 MB or less.",
    ],
  ])("explains why %o can't be used", async (file, problem) => {
    const user = userEvent.setup({ applyAccept: false });
    await renderProfile();
    const input = screen.getByLabelText(/^Choose a new profile picture/);

    await user.upload(input, file);

    expect(setImage).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(problem);
    expect(input).toHaveAccessibleDescription(problem);
  });

  it("removes the current picture", async () => {
    const user = userEvent.setup();
    showProfile({ ...ada, image: "blob:ada" });
    const card = within(await renderProfile());

    await user.click(card.getByRole("button", { name: "Remove" }));

    expect(setImage).toHaveBeenCalledWith(null);
    expect(toastSuccess).toHaveBeenCalledWith("Profile picture removed");
  });
});

describe("name", () => {
  async function renderName() {
    await renderProfile();
    const card = within(screen.getByRole("region", { name: "Name" }));
    return {
      input: card.getByRole("textbox", { name: "Name" }),
      save: card.getByRole("button", { name: "Save" }),
    };
  }

  it("can only be saved once it changes", async () => {
    const user = userEvent.setup();
    const { input, save } = await renderName();
    expect(input).toHaveValue("Ada Lovelace");
    expect(save).toBeDisabled();

    await user.type(input, " ");
    expect(save).toBeDisabled();

    await user.clear(input);
    await user.type(input, "Ada King");
    expect(save).toBeEnabled();
  });

  it("saves the new name without surrounding spaces", async () => {
    const user = userEvent.setup();
    const { input, save } = await renderName();

    await user.clear(input);
    await user.type(input, "  Ada King ");
    await user.click(save);

    expect(updateName).toHaveBeenCalledWith("Ada King");
    expect(toastSuccess).toHaveBeenCalledWith("Name updated");
  });

  it.each([
    ["   ", "Enter your name"],
    ["x".repeat(65), "Use 64 characters or fewer"],
  ])("rejects %j", async (name, problem) => {
    const user = userEvent.setup();
    const { input, save } = await renderName();

    await user.clear(input);
    await user.type(input, name);
    await user.click(save);

    expect(updateName).not.toHaveBeenCalled();
    expect(await screen.findByText(problem)).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("sidebar", () => {
  it("shows the name from your profile", async () => {
    showProfile({ ...ada, name: "Ada King" });
    await renderProfile();

    const footer = document.querySelector("[data-sidebar=footer]");
    if (!(footer instanceof HTMLElement)) throw new Error("No sidebar footer");
    expect(within(footer).getByText("Ada King")).toBeInTheDocument();
  });
});
