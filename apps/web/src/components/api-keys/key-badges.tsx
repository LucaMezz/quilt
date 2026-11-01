import { CircleOffIcon, ClockAlertIcon } from "lucide-react";

import { StatusBadge, type Tone } from "@/components/display/status-badge";
import type { KeyStatus } from "@/lib/api-keys/describe";

const STATUS = {
  active: { label: "Active", tone: "success", icon: undefined },
  disabled: { label: "Disabled", tone: "neutral", icon: <CircleOffIcon /> },
  expired: { label: "Expired", tone: "danger", icon: undefined },
} satisfies Record<
  KeyStatus,
  { label: string; tone: Tone; icon: React.ReactElement | undefined }
>;

export function KeyStatusBadge({ status }: { status: KeyStatus }) {
  const { label, tone, icon } = STATUS[status];
  return (
    <StatusBadge tone={tone} icon={icon}>
      {label}
    </StatusBadge>
  );
}

export function ExpiresSoonBadge() {
  return (
    <StatusBadge tone="warning" icon={<ClockAlertIcon />}>
      Expires soon
    </StatusBadge>
  );
}
