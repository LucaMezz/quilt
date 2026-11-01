import { Avatar, AvatarFallback } from "@quilt/ui/components/avatar";
import { cn } from "@quilt/ui/lib/utils";
import { ExternalLinkIcon } from "lucide-react";

import { RelativeTime } from "@/components/display/relative-time";
import type { App } from "@/lib/apps/use-apps";

export function AppAvatar({ app, size }: { app: App; size?: "lg" }) {
  return (
    <Avatar
      className="rounded-md after:rounded-md"
      size={size}
      aria-hidden="true"
    >
      <AvatarFallback className="rounded-md">
        {app.name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function Hostname({ app, className }: { app: App; className?: string }) {
  return (
    <a
      href={`https://${app.hostname}`}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "relative inline-flex w-fit min-w-0 items-center gap-1 text-muted-foreground text-sm hover:text-foreground hover:underline",
        className,
      )}
    >
      <span className="truncate">{app.hostname}</span>
      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function LiveDeployment({ app }: { app: App }) {
  if (!app.liveDeployment) {
    return <span className="text-muted-foreground">No deployments yet</span>;
  }
  return (
    <span>
      v{app.liveDeployment.version} ·{" "}
      <RelativeTime date={app.liveDeployment.deployedAt} fallback="Unknown" />
    </span>
  );
}
