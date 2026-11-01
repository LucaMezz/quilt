import { CircleDashedIcon, LoaderCircleIcon, MoonIcon } from "lucide-react";

import { StatusBadge, type Tone } from "@/components/display/status-badge";
import type { AppStatus } from "@/lib/apps/use-apps";

const STATUS = {
  running: { label: "Running", tone: "success", icon: undefined },
  sleeping: { label: "Sleeping", tone: "neutral", icon: <MoonIcon /> },
  pending: {
    label: "Not deployed",
    tone: "neutral",
    icon: <CircleDashedIcon />,
  },
  destroying: {
    label: "Destroying",
    tone: "danger",
    icon: (
      <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />
    ),
  },
} satisfies Record<
  AppStatus,
  { label: string; tone: Tone; icon: React.ReactElement | undefined }
>;

export function AppStatusBadge({ status }: { status: AppStatus }) {
  const { label, tone, icon } = STATUS[status];
  return (
    <StatusBadge tone={tone} icon={icon}>
      {label}
    </StatusBadge>
  );
}

export const statusOrder: Record<AppStatus, number> = {
  running: 0,
  sleeping: 1,
  pending: 2,
  destroying: 3,
};
