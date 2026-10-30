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

import { type ApiKey, useDeleteApiKey } from "@/lib/api-keys/use-api-keys";

export function DeleteApiKey({ apiKey }: { apiKey: ApiKey }) {
  const deleteKey = useDeleteApiKey();
  const navigate = useNavigate();
  const name = apiKey.name ?? "this key";

  return (
    <section
      aria-labelledby="delete-key-heading"
      className="flex flex-col gap-3 rounded-lg border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <h3 id="delete-key-heading" className="font-medium">
          Delete this key
        </h3>
        <p className="text-muted-foreground text-sm">
          Anything using it stops working immediately. This can't be undone.
        </p>
      </div>
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
                navigate({ to: "/settings/api-keys" });
              }}
            >
              Delete key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
