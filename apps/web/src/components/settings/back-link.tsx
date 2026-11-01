import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";

export function BackLink({
  to,
  children,
}: {
  to: LinkProps["to"];
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-1 rounded-sm text-muted-foreground text-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronLeftIcon aria-hidden="true" className="size-4" />
      {children}
    </Link>
  );
}
