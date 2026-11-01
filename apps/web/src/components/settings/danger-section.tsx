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

import { SectionCard } from "./section-card";

export function DangerSection({
  title,
  description,
  actionLabel,
  confirmTitle,
  confirmDescription = description,
  onConfirm,
  level,
}: {
  title: string;
  description: string;
  actionLabel: string;
  confirmTitle: string;
  confirmDescription?: string;
  onConfirm: () => void;
  level?: 2 | 3;
}) {
  return (
    <SectionCard
      level={level}
      title={title}
      description={description}
      className="ring-destructive/30"
      action={
        <AlertDialog>
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
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onConfirm}>
                {actionLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}
