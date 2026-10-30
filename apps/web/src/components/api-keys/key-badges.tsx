import { ACCESS_LEVEL_LABELS, type AccessLevel } from "@quilt/auth/permissions";
import { Badge } from "@quilt/ui/components/badge";
import {
  CircleCheckIcon,
  CircleOffIcon,
  CircleXIcon,
  ClockAlertIcon,
  EyeIcon,
  PencilIcon,
  ShieldOffIcon,
} from "lucide-react";

import type { KeyStatus } from "@/lib/api-keys/describe";

const STATUS = {
  active: {
    label: "Active",
    icon: (
      <CircleCheckIcon className="text-emerald-600 dark:text-emerald-400" />
    ),
    variant: "secondary",
  },
  disabled: {
    label: "Disabled",
    icon: <CircleOffIcon />,
    variant: "outline",
  },
  expired: {
    label: "Expired",
    icon: <CircleXIcon />,
    variant: "destructive",
  },
} as const;

export function StatusBadge({ status }: { status: KeyStatus }) {
  const { label, icon, variant } = STATUS[status];
  return (
    <Badge variant={variant}>
      <span aria-hidden="true" className="contents">
        {icon}
      </span>
      {label}
    </Badge>
  );
}

export function ExpiresSoonBadge() {
  return (
    <Badge
      variant="outline"
      className="border-amber-500/40 text-amber-700 dark:text-amber-400"
    >
      <span aria-hidden="true" className="contents">
        <ClockAlertIcon />
      </span>
      Expires soon
    </Badge>
  );
}

const ACCESS_ICONS = {
  none: <ShieldOffIcon />,
  read: <EyeIcon />,
  write: <PencilIcon />,
} as const;

export function AccessBadge({ level }: { level: AccessLevel }) {
  return (
    <Badge
      variant={level === "write" ? "outline" : "secondary"}
      className={
        level === "write"
          ? "border-amber-500/40 text-amber-700 dark:text-amber-400"
          : undefined
      }
    >
      <span aria-hidden="true" className="contents">
        {ACCESS_ICONS[level]}
      </span>
      {ACCESS_LEVEL_LABELS[level]}
    </Badge>
  );
}
