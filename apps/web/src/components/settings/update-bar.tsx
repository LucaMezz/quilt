import { Button } from "@quilt/ui/components/button";

export function UpdateBar({
  changed,
  canUpdate = true,
  label,
  onDiscard,
  onUpdate,
}: {
  changed: boolean;
  canUpdate?: boolean;
  label: string;
  onDiscard: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {changed && (
        <p className="mr-auto text-muted-foreground text-sm">
          You have unsaved changes.
        </p>
      )}
      <Button variant="outline" disabled={!changed} onClick={onDiscard}>
        Discard
      </Button>
      <Button disabled={!changed || !canUpdate} onClick={onUpdate}>
        {label}
      </Button>
    </div>
  );
}
