import type { ApiKeyPermissions } from "@quilt/auth/permissions";
import { Button } from "@quilt/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { samePermissions } from "@/lib/api-keys/describe";
import {
  type ApiKey,
  useUpdateApiKeyPermissions,
} from "@/lib/api-keys/use-api-keys";

import { AddPermission, PermissionList } from "./permission-list";

export function PermissionsEditor({ apiKey }: { apiKey: ApiKey }) {
  const update = useUpdateApiKeyPermissions();
  const [draft, setDraft] = useState<ApiKeyPermissions>(apiKey.permissions);
  const changed = !samePermissions(draft, apiKey.permissions);
  const name = apiKey.name ?? "this key";

  return (
    <SectionCard
      level={3}
      title="Permissions"
      description="What this key can do on your behalf. Changes apply once you update."
      action={<AddPermission permissions={draft} onChange={setDraft} />}
    >
      <div className="flex flex-col gap-4">
        <PermissionList
          permissions={draft}
          onChange={setDraft}
          emptyHint="This key can't do anything until you add a permission."
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {changed && (
            <p className="mr-auto text-muted-foreground text-sm">
              You have unsaved changes.
            </p>
          )}
          <Button
            variant="outline"
            disabled={!changed}
            onClick={() => setDraft(apiKey.permissions)}
          >
            Discard
          </Button>
          <Button
            disabled={!changed}
            onClick={() => {
              update(apiKey.id, draft);
              toast.success(`Updated permissions for ${name}`);
            }}
          >
            Update permissions
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
