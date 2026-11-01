import { Button } from "@quilt/ui/components/button";

import { useFormContext } from "./context";

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending: React.ReactNode;
}) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? pending : children}
        </Button>
      )}
    </form.Subscribe>
  );
}
