import { relativeTime } from "@/lib/relative-time";

export function RelativeTime({
  date,
  fallback,
}: {
  date: Date | null;
  fallback: string;
}) {
  if (!date) return <span className="text-muted-foreground">{fallback}</span>;
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {relativeTime(date)}
    </time>
  );
}
