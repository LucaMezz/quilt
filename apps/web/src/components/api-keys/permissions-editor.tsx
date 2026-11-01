import type { ApiKeyPermissions } from "@quilt/auth/permissions";
import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { UpdateBar } from "@/components/settings/update-bar";
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
        <UpdateBar
          changed={changed}
          label="Update permissions"
          onDiscard={() => setDraft(apiKey.permissions)}
          onUpdate={() => {
            update(apiKey.id, draft);
            toast.success(`Updated permissions for ${name}`);
          }}
        />
      </div>
    </SectionCard>
  );
}
