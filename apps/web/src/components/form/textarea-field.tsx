import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@quilt/ui/components/field";
import { Textarea } from "@quilt/ui/components/textarea";

import { useFieldContext } from "./context";
import { describedBy } from "./described-by";

export function TextareaField({
  label,
  description,
  id,
  className,
  ...textarea
}: Omit<
  React.ComponentProps<typeof Textarea>,
  "value" | "onChange" | "onBlur" | "name"
> & {
  label: string;
  description?: React.ReactNode;
}) {
  const field = useFieldContext<string>();
  const isInvalid = !field.state.meta.isValid;
  const textareaId = id ?? field.name;
  const aria = describedBy(textareaId, {
    description: Boolean(description),
    invalid: isInvalid,
  });

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={textareaId}>{label}</FieldLabel>
      <Textarea
        {...textarea}
        id={textareaId}
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
