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
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { type ApiKey, useDeleteApiKey } from "@/lib/api-keys/use-api-keys";

export function DeleteApiKey({ apiKey }: { apiKey: ApiKey }) {
  const deleteKey = useDeleteApiKey();
  const navigate = useNavigate();
  const name = apiKey.name ?? "this key";

  return (
    <SectionCard
      level={3}
      title="Delete this key"
      description="Anything using it stops working immediately. This can't be undone."
      className="ring-destructive/30"
      action={
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            Delete key
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Anything using this key stops working immediately. This can't be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  deleteKey(apiKey.id);
                  toast.success(`Deleted API key ${name}`);
                  navigate({ to: "/account/api-keys" });
                }}
              >
                Delete key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}
