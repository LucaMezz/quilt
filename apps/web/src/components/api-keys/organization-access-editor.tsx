import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { UpdateBar } from "@/components/settings/update-bar";
import {
  accessFor,
  choiceFor,
  missingOrganizations,
  sameOrganizationAccess,
} from "@/lib/api-keys/organization-access";
import {
  type ApiKey,
  useUpdateApiKeyOrganizations,
} from "@/lib/api-keys/use-api-keys";

import { OrganizationAccessFields } from "./organization-access-fields";

export function OrganizationAccessEditor({ apiKey }: { apiKey: ApiKey }) {
  const update = useUpdateApiKeyOrganizations();
  const [draft, setDraft] = useState(() => choiceFor(apiKey.organizations));
  const missing = missingOrganizations(draft);
  const changed = !sameOrganizationAccess(
    accessFor(draft),
    apiKey.organizations,
  );
  const name = apiKey.name ?? "this key";

  return (
    <SectionCard
      level={3}
      title="Organization access"
      description="Which of your organizations this key can reach. Changes apply once you update."
    >
      <div className="flex flex-col gap-6">
        <OrganizationAccessFields
          value={draft}
          onChange={setDraft}
          errors={
            missing
              ? [{ message: "Choose at least one organization" }]
              : undefined
          }
        />
        <UpdateBar
          changed={changed}
          canUpdate={!missing}
          label="Update organization access"
          onDiscard={() => setDraft(choiceFor(apiKey.organizations))}
          onUpdate={() => {
            update(apiKey.id, accessFor(draft));
            toast.success(`Updated organization access for ${name}`);
          }}
        />
      </div>
    </SectionCard>
  );
}
