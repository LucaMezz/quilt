import { Field, FieldLabel } from "@quilt/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@quilt/ui/components/input-group";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied the new key");
  } catch {
    toast.error("Couldn't copy the key. Select it and copy it instead.");
  }
}

export function SecretField({
  id,
  label,
  secret,
}: {
  id: string;
  label: string;
  secret: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          readOnly
          value={secret}
          className="font-mono"
          onFocus={(event) => event.currentTarget.select()}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Copy key"
            onClick={() => copy(secret)}
          >
            <CopyIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
