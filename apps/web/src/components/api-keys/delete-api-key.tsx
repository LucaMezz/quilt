import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { DangerSection } from "@/components/settings/danger-section";
import { type ApiKey, useDeleteApiKey } from "@/lib/api-keys/use-api-keys";

export function DeleteApiKey({ apiKey }: { apiKey: ApiKey }) {
  const deleteKey = useDeleteApiKey();
  const navigate = useNavigate();
  const name = apiKey.name ?? "this key";

  return (
    <DangerSection
      level={3}
      title="Delete this key"
      description="Anything using it stops working immediately. This can't be undone."
      actionLabel="Delete key"
      confirmTitle={`Delete ${name}?`}
      confirmDescription="Anything using this key stops working immediately. This can't be undone."
      onConfirm={() => {
        deleteKey(apiKey.id);
        toast.success(`Deleted API key ${name}`);
        navigate({ to: "/account/api-keys" });
      }}
    />
  );
}
