import { createFileRoute } from "@tanstack/react-router";

import { DeleteApiKey } from "@/components/api-keys/delete-api-key";
import {
  ExpiresSoonBadge,
  KeyStatusBadge,
} from "@/components/api-keys/key-badges";
import { KeyStatusSection } from "@/components/api-keys/key-status";
import { OrganizationAccessEditor } from "@/components/api-keys/organization-access-editor";
import { PermissionsEditor } from "@/components/api-keys/permissions-editor";
import { RegenerateApiKey } from "@/components/api-keys/regenerate-api-key";
import { Detail, DetailList } from "@/components/display/detail-list";
import { RelativeTime } from "@/components/display/relative-time";
import { BackLink } from "@/components/settings/back-link";
import { SectionCard } from "@/components/settings/section-card";
import { expiresSoon, keyStatus } from "@/lib/api-keys/describe";
import { useApiKey } from "@/lib/api-keys/use-api-keys";

export const Route = createFileRoute("/_auth/_user/account/api-keys/$keyId")({
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
        <BackLink to="/account/api-keys">Back to API keys</BackLink>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink to="/account/api-keys">All API keys</BackLink>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-xl">
            {apiKey.name ?? "Unnamed key"}
          </h2>
          <KeyStatusBadge status={keyStatus(apiKey)} />
          {expiresSoon(apiKey) && <ExpiresSoonBadge />}
        </div>
        {apiKey.description && (
          <p className="text-muted-foreground">{apiKey.description}</p>
        )}
      </div>
      <KeyStatusSection apiKey={apiKey} />
      <SectionCard level={3} title="Details">
        <DetailList>
          <Detail label="Key">
            <code>{apiKey.start ? `${apiKey.start}…` : "Hidden"}</code>
          </Detail>
          <Detail label="ID">
            <code className="break-all">{apiKey.id}</code>
          </Detail>
          <Detail label="Created">
            <RelativeTime date={apiKey.createdAt} fallback="Unknown" />
          </Detail>
          <Detail label="Expires">
            <RelativeTime date={apiKey.expiresAt} fallback="Never" />
          </Detail>
          <Detail label="Last used">
            <RelativeTime date={apiKey.lastRequest} fallback="Never used" />
          </Detail>
        </DetailList>
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
