import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@quilt/ui/components/attachment";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@quilt/ui/components/avatar";
import { Bubble, BubbleContent } from "@quilt/ui/components/bubble";
import { Button } from "@quilt/ui/components/button";
import { Marker, MarkerContent, MarkerIcon } from "@quilt/ui/components/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@quilt/ui/components/message";
import { Spinner } from "@quilt/ui/components/spinner";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

/**
 * Lays out conversation messages with avatar, content, header, footer, and alignment.
 */
const meta: Meta<typeof Message> = {
  title: "ui/base/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    align: {
      control: "select",
      options: ["start", "end"],
    },
  },
  args: {
    align: "start",
  },
  decorators: (Story) => (
    <div className="w-full min-w-sm max-w-md">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

function AvatarSlot() {
  return (
    <MessageAvatar>
      <Avatar className="size-8">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </MessageAvatar>
  );
}

/**
 * The default message row wraps a bubble surface.
 */
export const Default: Story = {
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        <Bubble variant="secondary">
          <BubbleContent>How can I help you today?</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
};

/**
 * Align a message to the end for current-user messages.
 */
export const AlignedEnd: Story = {
  parameters: { a11y: { test: "todo" } },
  args: {
    align: "end",
  },
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        <Bubble>
          <BubbleContent>Deploying to prod real quick.</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
};

/**
 * Add an avatar beside a message.
 */
export const WithAvatar: Story = {
  parameters: { a11y: { test: "todo" } },
  render: (args) => (
    <Message {...args}>
      <AvatarSlot />
      <MessageContent>
        <Bubble variant="secondary">
          <BubbleContent>
            The build failed during dependency installation.
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
};

/**
 * Group consecutive messages from the same sender.
 */
export const Group: Story = {
  parameters: { a11y: { test: "todo" } },
  render: () => (
    <MessageGroup>
      <Message>
        <MessageAvatar />
        <MessageContent>
          <Bubble variant="secondary">
            <BubbleContent>I checked the registry addresses.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <AvatarSlot />
        <MessageContent>
          <Bubble variant="secondary">
            <BubbleContent>
              The component and example JSON now live under the UI registry.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

/**
 * Use MessageHeader for sender names or concise context.
 */
export const Header: Story = {
  parameters: { a11y: { test: "todo" } },
  render: (args) => (
    <Message {...args}>
      <AvatarSlot />
      <MessageContent>
        <MessageHeader>Olivia</MessageHeader>
        <Bubble variant="secondary">
          <BubbleContent>I already checked the logs.</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
};

/**
 * Use MessageFooter for delivery state or timestamps.
 */
export const Footer: Story = {
  parameters: { a11y: { test: "todo" } },
  args: {
    align: "end",
  },
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        <Bubble>
          <BubbleContent>Send the report to the team.</BubbleContent>
        </Bubble>
        <MessageFooter>Read yesterday</MessageFooter>
      </MessageContent>
    </Message>
  ),
};

/**
 * Place message-level actions in MessageFooter.
 */
export const Actions: Story = {
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        <Bubble variant="secondary">
          <BubbleContent>
            The install failure is coming from the workspace package.
          </BubbleContent>
        </Bubble>
        <MessageFooter className="gap-1">
          <Button variant="ghost" size="icon-xs" aria-label="Copy message">
            <CopyIcon />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Retry message">
            <RefreshCcwIcon />
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  ),
};

/**
 * Add attachments inside message content.
 */
export const WithAttachment: Story = {
  parameters: { a11y: { test: "todo" } },
  render: (args) => (
    <Message {...args}>
      <AvatarSlot />
      <MessageContent>
        <Bubble variant="secondary">
          <BubbleContent>
            Done. Here is the PDF with the image added as the cover page.
          </BubbleContent>
        </Bubble>
        <Attachment>
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Download sales-dashboard.pdf">
              <DownloadIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </MessageContent>
    </Message>
  ),
};

/**
 * Use a status marker for in-progress message work.
 */
export const WithStatus: Story = {
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        <Marker role="status">
          <MarkerIcon>
            <Spinner />
          </MarkerIcon>
          <MarkerContent>Checking the logs...</MarkerContent>
        </Marker>
      </MessageContent>
    </Message>
  ),
};

/**
 * Verify copy actions in the message footer are clickable.
 */
export const CopyAction: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Message>
      <MessageContent>
        <Bubble variant="secondary">
          <BubbleContent>Copy this message.</BubbleContent>
        </Bubble>
        <MessageFooter>
          <Button variant="ghost" size="icon-xs" aria-label="Copy message">
            <CopyIcon />
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /copy message/i });

    await userEvent.click(button);
    expect(button).toHaveFocus();
  },
};

/**
 * Verify retry actions in failed messages are clickable.
 */
export const RetryAction: Story = {
  parameters: { a11y: { test: "todo" } },
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Message>
      <MessageContent>
        <Bubble variant="destructive">
          <BubbleContent>Failed to send.</BubbleContent>
        </Bubble>
        <MessageFooter>
          <Button variant="ghost" size="icon-xs" aria-label="Retry message">
            <RefreshCcwIcon />
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /retry message/i });

    await userEvent.click(button);
    expect(button).toHaveFocus();
  },
};
