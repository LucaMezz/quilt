import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@quilt/ui/components/empty";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRoundIcon } from "lucide-react";

import { ApiKeyTable } from "@/components/api-keys/api-key-table";
import { SectionCard } from "@/components/settings/section-card";
import { useApiKeys } from "@/lib/api-keys/use-api-keys";

export const Route = createFileRoute("/_auth/_app/settings/api-keys/")({
  component: ApiKeysSettings,
  staticData: { breadcrumb: "API keys" },
});

function ApiKeysSettings() {
  const { keys } = useApiKeys();

  return (
    <SectionCard
      title="API keys"
      description="Keys let the quilt CLI and your scripts act as you. Each key can only do what you grant it."
    >
      {keys.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <KeyRoundIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No API keys yet</EmptyTitle>
            <EmptyDescription>
              Signing in with quilt login creates one for that device.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ApiKeyTable keys={keys} />
      )}
    </SectionCard>
  );
}
