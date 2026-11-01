import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@quilt/ui/components/field";
import { Input } from "@quilt/ui/components/input";

import { useFieldContext } from "./context";
import { describedBy } from "./described-by";

export function TextField({
  label,
  description,
  id,
  hideLabel,
  className,
  ...input
}: Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur" | "name"
> & {
  label: string;
  description?: React.ReactNode;
  hideLabel?: boolean;
}) {
  const field = useFieldContext<string>();
  const isInvalid = !field.state.meta.isValid;
  const inputId = id ?? field.name;
  const aria = describedBy(inputId, {
    description: Boolean(description),
    invalid: isInvalid,
  });

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel
        htmlFor={inputId}
        className={hideLabel ? "sr-only" : undefined}
      >
        {label}
      </FieldLabel>
      <Input
        {...input}
        id={inputId}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={aria.describedBy}
      />
      {description && (
        <FieldDescription id={aria.description}>{description}</FieldDescription>
      )}
      <FieldError id={aria.error} errors={field.state.meta.errors} />
    </Field>
  );
}
