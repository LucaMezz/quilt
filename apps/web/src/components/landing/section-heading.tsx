import { cn } from "@quilt/ui/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
      <p className="font-medium text-primary text-sm">{eyebrow}</p>
      <h2 className="mt-2 text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-balance text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
