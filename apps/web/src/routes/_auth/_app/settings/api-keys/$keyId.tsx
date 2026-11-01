import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

import { DeleteApiKey } from "@/components/api-keys/delete-api-key";
import {
  ExpiresSoonBadge,
  StatusBadge,
} from "@/components/api-keys/key-badges";
import { PermissionsTable } from "@/components/api-keys/permissions-table";
import { RegenerateApiKey } from "@/components/api-keys/regenerate-api-key";
import { When } from "@/components/api-keys/when";
import { expiresSoon, keyStatus } from "@/lib/api-keys/describe";
import { useApiKey } from "@/lib/api-keys/use-api-keys";

export const Route = createFileRoute("/_auth/_app/settings/api-keys/$keyId")({
  component: ApiKeyPage,
  staticData: { breadcrumb: "API key" },
});

const backLink =
  "inline-flex w-fit items-center gap-1 rounded-sm text-muted-foreground text-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

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
        <Link to="/settings/api-keys" className={backLink}>
          Back to API keys
        </Link>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link to="/settings/api-keys" className={backLink}>
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
          All API keys
        </Link>
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
      </div>
      <section
        aria-labelledby="permissions-heading"
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <h3 id="permissions-heading" className="font-medium">
            Permissions
          </h3>
          <p className="text-muted-foreground text-sm">
            What this key can do on your behalf.
          </p>
        </div>
        <PermissionsTable permissions={apiKey.permissions} />
      </section>
      <RegenerateApiKey apiKey={apiKey} />
      <DeleteApiKey apiKey={apiKey} />
    </div>
  );
}
