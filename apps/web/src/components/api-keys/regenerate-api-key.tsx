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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@quilt/ui/components/select";
import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { EXPIRATIONS, expiryDate } from "@/lib/api-keys/expiration";
import { type ApiKey, useRegenerateApiKey } from "@/lib/api-keys/use-api-keys";

import { SecretField } from "./secret-field";

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

  return (
    <SectionCard
      level={3}
      title="Regenerate this key"
      description="Replace its secret and choose a new expiration. Its name, description and permissions stay the same."
      action={
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
                <SecretField
                  id="regenerated-key"
                  label="New key"
                  secret={secret}
                />
                <DialogFooter>
                  <Button onClick={() => onOpenChange(false)}>Done</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      }
    />
  );
}
