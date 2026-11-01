import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@quilt/ui/components/alert-dialog";
import { Button } from "@quilt/ui/components/button";
import { Field, FieldLabel } from "@quilt/ui/components/field";
import { Input } from "@quilt/ui/components/input";
import { useId, useState } from "react";

import { SectionCard } from "./section-card";

export function DangerSection({
  title,
  description,
  actionLabel,
  confirmTitle,
  confirmDescription = description,
  confirmText,
  onConfirm,
  level,
}: {
  title: string;
  description: string;
  actionLabel: string;
  confirmTitle: string;
  confirmDescription?: string;
  confirmText?: string;
  onConfirm: () => void;
  level?: 2 | 3;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const confirmed = !confirmText || typed.trim() === confirmText;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTyped("");
  }

  function confirm() {
    if (!confirmed) return;
    onOpenChange(false);
    onConfirm();
  }

  return (
    <SectionCard
      level={level}
      title={title}
      description={description}
      className="ring-destructive/30"
      action={
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            {actionLabel}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {confirmText && (
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  confirm();
                }}
              >
                <Field>
                  <FieldLabel htmlFor={inputId} className="font-normal">
                    <span>
                      Type <code className="font-semibold">{confirmText}</code>{" "}
                      to confirm
                    </span>
                  </FieldLabel>
                  <Input
                    id={inputId}
                    value={typed}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="font-mono"
                    onChange={(event) => setTyped(event.target.value)}
                  />
                </Field>
              </form>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!confirmed}
                onClick={confirm}
              >
                {actionLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}
