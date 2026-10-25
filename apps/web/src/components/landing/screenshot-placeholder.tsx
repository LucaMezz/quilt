import { cn } from "@quilt/ui/lib/utils";
import { ImageIcon } from "lucide-react";

export function ScreenshotPlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 text-muted-foreground",
        className,
      )}
    >
      <ImageIcon className="size-6" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
