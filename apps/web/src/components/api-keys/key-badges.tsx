import { Badge } from "@quilt/ui/components/badge";
import {
  CircleCheckIcon,
  CircleOffIcon,
  CircleXIcon,
  ClockAlertIcon,
} from "lucide-react";

import type { KeyStatus } from "@/lib/api-keys/describe";

const STATUS = {
  active: {
    label: "Active",
    icon: (
      <CircleCheckIcon
        aria-hidden="true"
        className="text-emerald-600 dark:text-emerald-400"
      />
    ),
    variant: "secondary",
  },
  disabled: {
    label: "Disabled",
    icon: <CircleOffIcon aria-hidden="true" />,
    variant: "outline",
  },
  expired: {
    label: "Expired",
    icon: <CircleXIcon aria-hidden="true" />,
    variant: "destructive",
  },
} as const;

export function StatusBadge({ status }: { status: KeyStatus }) {
  const { label, icon, variant } = STATUS[status];
  return (
    <Badge variant={variant} size="lg">
      {icon}
      {label}
    </Badge>
  );
}

export function ExpiresSoonBadge() {
  return (
    <Badge
      variant="outline"
      size="lg"
      className="border-amber-500/40 text-amber-700 dark:text-amber-400"
    >
      <ClockAlertIcon aria-hidden="true" />
      Expires soon
    </Badge>
  );
}
