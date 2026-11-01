import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@quilt/ui/components/alert";
import { buttonVariants } from "@quilt/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@quilt/ui/components/empty";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRoundIcon, PlusIcon, ShieldAlertIcon } from "lucide-react";

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
      action={
        <Link to="/settings/api-keys/new" className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          New key
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert variant="warning" role="note">
          <ShieldAlertIcon aria-hidden="true" />
          <AlertTitle>Keep your keys secure</AlertTitle>
          <AlertDescription>
            A key can do anything you can within the permissions you give it.
            Don't share it or commit it to a repository, and delete any key you
            think has leaked.
          </AlertDescription>
        </Alert>
        {keys.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRoundIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No API keys yet</EmptyTitle>
              <EmptyDescription>
                Create a key for a script or CI job. Signing in with quilt login
                also creates one for that device.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/settings/api-keys/new"
                className={buttonVariants({ variant: "outline" })}
              >
                <PlusIcon data-icon="inline-start" aria-hidden="true" />
                Create key
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <ApiKeyTable keys={keys} />
        )}
      </div>
    </SectionCard>
  );
}
