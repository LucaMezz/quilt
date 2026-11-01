import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@quilt/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@quilt/ui/components/input-group";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export function CopyField({
  id,
  label,
  value,
  description,
  copyLabel = "Copy",
  copiedMessage = "Copied to your clipboard",
}: {
  id: string;
  label: string;
  value: string;
  description?: React.ReactNode;
  copyLabel?: string;
  copiedMessage?: string;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(copiedMessage);
    } catch {
      toast.error("Couldn't copy it. Select the text and copy it instead.");
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          readOnly
          value={value}
          className="font-mono"
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={copyLabel}
            onClick={copy}
          >
            <CopyIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
