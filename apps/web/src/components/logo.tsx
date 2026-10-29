import { cn } from "@quilt/ui/lib/utils";
import { Link } from "@tanstack/react-router";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="grid size-5 grid-cols-2 gap-0.5">
        <span className="rounded-[2px] bg-primary" />
        <span className="rounded-[2px] bg-primary/40" />
        <span className="rounded-[2px] bg-primary/40" />
        <span className="rounded-[2px] bg-primary" />
      </span>
      quilt
    </Link>
  );
}
