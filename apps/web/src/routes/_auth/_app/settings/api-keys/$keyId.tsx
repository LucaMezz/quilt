import { createFileRoute } from "@tanstack/react-router";

import { DeleteApiKey } from "@/components/api-keys/delete-api-key";
import {
  ExpiresSoonBadge,
  StatusBadge,
} from "@/components/api-keys/key-badges";
import { KeyStatusSection } from "@/components/api-keys/key-status";
import { OrganizationAccessEditor } from "@/components/api-keys/organization-access-editor";
import { PermissionsEditor } from "@/components/api-keys/permissions-editor";
import { RegenerateApiKey } from "@/components/api-keys/regenerate-api-key";
import { When } from "@/components/api-keys/when";
import { BackLink } from "@/components/settings/back-link";
import { SectionCard } from "@/components/settings/section-card";
import { expiresSoon, keyStatus } from "@/lib/api-keys/describe";
import { useApiKey } from "@/lib/api-keys/use-api-keys";

export const Route = createFileRoute("/_auth/_app/settings/api-keys/$keyId")({
  component: ApiKeyPage,
  staticData: { breadcrumb: "API key" },
});

function ApiKeyPage() {
  const { keyId } = Route.useParams();
  const apiKey = useApiKey(keyId);

  if (!apiKey) {
    return (
      <section className="flex flex-col items-start gap-3">
        <h2 className="font-semibold text-lg">API key not found</h2>
        <p className="text-muted-foreground text-sm">
          It may have been deleted.
        </p>
        <BackLink to="/settings/api-keys">Back to API keys</BackLink>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink to="/settings/api-keys">All API keys</BackLink>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-xl">
            {apiKey.name ?? "Unnamed key"}
          </h2>
          <StatusBadge status={keyStatus(apiKey)} />
          {expiresSoon(apiKey) && <ExpiresSoonBadge />}
        </div>
        {apiKey.description && (
          <p className="text-muted-foreground">{apiKey.description}</p>
        )}
      </div>
      <KeyStatusSection apiKey={apiKey} />
      <SectionCard level={3} title="Details">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Key</dt>
          <dd>
            <code>{apiKey.start ? `${apiKey.start}…` : "Hidden"}</code>
          </dd>
          <dt className="text-muted-foreground">ID</dt>
          <dd className="min-w-0 break-all">
            <code>{apiKey.id}</code>
          </dd>
          <dt className="text-muted-foreground">Created</dt>
          <dd>
            <When date={apiKey.createdAt} never="Unknown" />
          </dd>
          <dt className="text-muted-foreground">Expires</dt>
          <dd>
            <When date={apiKey.expiresAt} never="Never" />
          </dd>
          <dt className="text-muted-foreground">Last used</dt>
          <dd>
            <When date={apiKey.lastRequest} never="Never used" />
          </dd>
        </dl>
      </SectionCard>
      <OrganizationAccessEditor
        key={`${apiKey.id}-organizations`}
        apiKey={apiKey}
      />
      <PermissionsEditor key={apiKey.id} apiKey={apiKey} />
      <RegenerateApiKey apiKey={apiKey} />
      <DeleteApiKey apiKey={apiKey} />
    </div>
  );
}
