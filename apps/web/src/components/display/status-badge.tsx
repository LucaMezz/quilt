import { Badge } from "@quilt/ui/components/badge";
import { cn } from "@quilt/ui/lib/utils";
import {
  CircleCheckIcon,
  CircleIcon,
  CircleXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cloneElement, type ReactElement } from "react";

export type Tone = "success" | "neutral" | "warning" | "danger";

const TONES = {
  success: {
    variant: "secondary",
    icon: <CircleCheckIcon />,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    className: undefined,
  },
  neutral: {
    variant: "outline",
    icon: <CircleIcon />,
    iconClass: undefined,
    className: undefined,
  },
  warning: {
    variant: "outline",
    icon: <TriangleAlertIcon />,
    iconClass: undefined,
    className: "border-amber-500/40 text-amber-700 dark:text-amber-400",
  },
  danger: {
    variant: "destructive",
    icon: <CircleXIcon />,
    iconClass: undefined,
    className: undefined,
  },
} as const;

export function StatusBadge({
  tone,
  icon,
  children,
}: {
  tone: Tone;
  icon?: ReactElement<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  const style = TONES[tone];
  const shown = icon ?? style.icon;

  return (
    <Badge variant={style.variant} size="lg" className={style.className}>
      {cloneElement(shown, {
        "aria-hidden": true,
        className: cn(style.iconClass, shown.props.className),
      })}
      {children}
    </Badge>
  );
}
