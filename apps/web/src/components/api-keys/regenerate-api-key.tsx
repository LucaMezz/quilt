import { Button } from "@quilt/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@quilt/ui/components/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@quilt/ui/components/select";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { type ApiKey, useRegenerateApiKey } from "@/lib/api-keys/use-api-keys";

const EXPIRATIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "1 year" },
];

const DAY = 24 * 60 * 60 * 1000;

function expiryDate(days: number) {
  return new Date(Date.now() + days * DAY).toLocaleDateString(undefined, {
    dateStyle: "long",
  });
}

export function RegenerateApiKey({ apiKey }: { apiKey: ApiKey }) {
  const regenerate = useRegenerateApiKey();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(30);
  const [secret, setSecret] = useState<string | null>(null);
  const name = apiKey.name ?? "this key";

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSecret(null);
      setDays(30);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied the new key");
    } catch {
      toast.error("Couldn't copy the key. Select it and copy it instead.");
    }
  }

  return (
    <section
      aria-labelledby="regenerate-key-heading"
      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <h3 id="regenerate-key-heading" className="font-medium">
          Regenerate this key
        </h3>
        <p className="text-muted-foreground text-sm">
          Replace its secret and choose a new expiration. Its name, description
          and permissions stay the same.
        </p>
      </div>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        disablePointerDismissal={secret !== null}
      >
        <DialogTrigger render={<Button variant="outline" />}>
          Regenerate key
        </DialogTrigger>
        <DialogContent showCloseButton={secret === null}>
          {secret === null ? (
            <>
              <DialogHeader>
                <DialogTitle>Regenerate {name}?</DialogTitle>
                <DialogDescription>
                  Anything using the current key stops working immediately.
                  You'll need to update it with the new one.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="regenerate-expiration">
                  Expiration
                </FieldLabel>
                <Select
                  items={EXPIRATIONS}
                  value={days}
                  onValueChange={(value) => {
                    if (value !== null) setDays(value);
                  }}
                >
                  <SelectTrigger id="regenerate-expiration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  The new key expires on {expiryDate(days)}.
                </FieldDescription>
              </Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setSecret(regenerate(apiKey.id, days));
                    toast.success(`Regenerated API key ${name}`);
                  }}
                >
                  Regenerate key
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Copy your new key</DialogTitle>
                <DialogDescription>
                  This is the only time it's shown. Store it somewhere safe
                  before closing this dialog.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="regenerated-key">New key</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="regenerated-key"
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
              <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
