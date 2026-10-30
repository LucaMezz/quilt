import { relativeTime } from "@/lib/relative-time";

export function When({ date, never }: { date: Date | null; never: string }) {
  if (!date) return <span className="text-muted-foreground">{never}</span>;
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {relativeTime(date)}
    </time>
  );
}
