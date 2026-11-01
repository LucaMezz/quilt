import { buttonVariants } from "@quilt/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BoxesIcon } from "lucide-react";
import { toast } from "sonner";

import { AppStatusBadge } from "@/components/apps/app-status-badge";
import { AppAvatar, Hostname } from "@/components/apps/app-summary";
import { CollectionEmpty } from "@/components/collection/collection-empty";
import { Detail, DetailList } from "@/components/display/detail-list";
import { RelativeTime } from "@/components/display/relative-time";
import { BackLink } from "@/components/settings/back-link";
import { DangerSection } from "@/components/settings/danger-section";
import { SectionCard } from "@/components/settings/section-card";
import { type App, useApp, useDestroyApp } from "@/lib/apps/use-apps";

export const Route = createFileRoute("/_auth/organizations/$org/apps/$app")({
  component: AppPage,
  staticData: { breadcrumb: "App" },
});

function AppPage() {
  const { org, app: name } = Route.useParams();
  const app = useApp(org, name);

  if (!app) {
    return (
      <CollectionEmpty
        icon={<BoxesIcon />}
        title="App not found"
        description="It may have been destroyed, or it belongs to another organization."
        action={
          <Link
            to="/organizations/$org/apps"
            params={{ org }}
            className={buttonVariants()}
          >
            All apps
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink to="/organizations/$org/apps" params={{ org }}>
          All apps
        </BackLink>
        <div className="flex items-center gap-3">
          <AppAvatar app={app} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-semibold text-2xl">{app.name}</h1>
              <AppStatusBadge status={app.status} />
            </div>
            <Hostname app={app} />
          </div>
        </div>
      </div>
      <LiveDeploymentSection app={app} />
      <SectionCard title="Details">
        <DetailList>
          <Detail label="Name">
            <code>{app.name}</code>
          </Detail>
          <Detail label="Hostname">
            <code>{app.hostname}</code>
          </Detail>
          <Detail label="ID">
            <code className="break-all">{app.id}</code>
          </Detail>
          <Detail label="Created">
            <RelativeTime date={app.createdAt} fallback="Unknown" />
          </Detail>
        </DetailList>
      </SectionCard>
      {app.status !== "destroying" && <DestroyApp app={app} />}
    </div>
  );
}

function LiveDeploymentSection({ app }: { app: App }) {
  const deployment = app.liveDeployment;
  return (
    <SectionCard
      title="Live deployment"
      description={
        deployment
          ? "The deployment serving the app's hostname."
          : "Nothing is deployed yet. Deploy an image to start serving the app."
      }
    >
      {deployment && (
        <DetailList>
          <Detail label="Version">v{deployment.version}</Detail>
          <Detail label="Image">
            <code className="break-all">{deployment.image}</code>
          </Detail>
          <Detail label="Deployed">
            <RelativeTime date={deployment.deployedAt} fallback="Unknown" />
          </Detail>
        </DetailList>
      )}
    </SectionCard>
  );
}

function DestroyApp({ app }: { app: App }) {
  const destroy = useDestroyApp();
  const navigate = Route.useNavigate();

  return (
    <DangerSection
      title="Destroy this app"
      description={`Its deployments are torn down and ${app.hostname} stops answering. This can't be undone.`}
      actionLabel="Destroy app"
      confirmTitle={`Destroy ${app.name}?`}
      confirmText={app.name}
      onConfirm={() => {
        destroy(app.id);
        toast.success(
          `Destroying ${app.name}… its workloads are being torn down`,
        );
        navigate({
          to: "/organizations/$org/apps",
          params: { org: app.organization },
        });
      }}
    />
  );
}
