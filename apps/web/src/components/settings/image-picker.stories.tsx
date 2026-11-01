import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { ImagePicker } from "./image-picker";

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#047857"/><path d="M20 20h40v40H20z" fill="#fff"/></svg>',
)}`;

type Props = React.ComponentProps<typeof ImagePicker>;

function ImagePickerStory({ image: initial, onChange, ...props }: Props) {
  const [image, setImage] = useState(initial);

  return (
    <ImagePicker
      {...props}
      image={image}
      onChange={(file) => {
        setImage(file ? URL.createObjectURL(file) : null);
        onChange(file);
      }}
    />
  );
}

const meta = {
  title: "web/settings/ImagePicker",
  component: ImagePickerStory,
  tags: ["autodocs"],
  args: {
    image: null,
    fallback: "AC",
    label: "logo",
    shape: "square",
    onChange: fn(),
  },
  argTypes: {
    shape: { control: "inline-radio", options: ["circle", "square"] },
  },
  render: (args) => <ImagePickerStory key={String(args.image)} {...args} />,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Picks an image for something, like a profile picture or a logo. Clicking the picture or Upload image opens the file chooser; a PNG, JPEG or WebP image of up to 5 MB goes to `onChange`, anything else shows why it can't be used. Remove calls `onChange(null)` and only shows once there's an `image`. `fallback` shows while there's no image, usually initials. `label` names the image for screen readers (\"Choose a new logo\"). Use `circle` for people and `square` for organizations and apps. Put the section around it, and anything that belongs beside the picture, like a name, in `children`.",
      },
    },
  },
} satisfies Meta<typeof ImagePickerStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Logo: Story = {};

export const WithImage: Story = {
  args: { image: LOGO },
};

export const ProfilePicture: Story = {
  args: {
    shape: "circle",
    fallback: "AL",
    label: "profile picture",
    children: (
      <div className="grid gap-0.5 text-sm">
        <span className="font-medium text-base">Ada Lovelace</span>
        <span className="text-muted-foreground">ada@example.com</span>
      </div>
    ),
  },
};

export const ChoosesImage: Story = {
  name: "when an image is chosen, passes it on",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const image = new File(["png"], "logo.png", { type: "image/png" });

    await userEvent.upload(canvas.getByLabelText(/^Choose a new logo/), image);

    await expect(args.onChange).toHaveBeenCalledWith(image);
    await expect(canvas.getByRole("button", { name: "Remove" })).toBeVisible();
  },
};

export const RejectsImage: Story = {
  name: "when the file isn't a usable image, explains why",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/^Choose a new logo/);

    await userEvent.upload(
      input,
      new File(["gif"], "logo.gif", { type: "image/gif" }),
      { applyAccept: false },
    );

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Choose a PNG, JPEG or WebP image.",
    );
    await expect(input).toHaveAccessibleDescription(
      "Choose a PNG, JPEG or WebP image.",
    );
  },
};

export const Removes: Story = {
  ...WithImage,
  name: "when removed, clears the image",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Remove" }));

    await expect(args.onChange).toHaveBeenCalledWith(null);
    await expect(canvas.queryByRole("button", { name: "Remove" })).toBeNull();
  },
};
