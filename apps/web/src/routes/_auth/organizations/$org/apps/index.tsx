import { Avatar, AvatarFallback } from "@quilt/ui/components/avatar";
import { Card } from "@quilt/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { BoxesIcon, ExternalLinkIcon } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import {
  AppStatusBadge,
  statusOrder,
} from "@/components/apps/app-status-badge";
import { Collection } from "@/components/collection/collection";
import { CollectionEmpty } from "@/components/collection/collection-empty";
import type { Column } from "@/components/collection/collection-table";
import { ViewSwitcher } from "@/components/collection/view-switcher";
import { viewSearch } from "@/components/collection/views";
import { RelativeTime } from "@/components/display/relative-time";
import { type App, useApps } from "@/lib/apps/use-apps";

export const Route = createFileRoute("/_auth/organizations/$org/apps/")({
  component: Apps,
  validateSearch: viewSearch,
  staticData: { breadcrumb: "Apps" },
});

const columns: Column<App>[] = [
  {
    key: "name",
    header: "Name",
    rowHeader: true,
    sortValue: (app) => app.name,
    cell: (app) => (
      <span className="flex items-center gap-3">
        <AppAvatar app={app} />
        <span className="font-medium">{app.name}</span>
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortValue: (app) => statusOrder[app.status],
    cell: (app) => <AppStatusBadge status={app.status} />,
  },
  {
    key: "hostname",
    header: "Hostname",
    cell: (app) => <Hostname app={app} />,
  },
  {
    key: "deployment",
    header: "Live deployment",
    sortValue: (app) => app.liveDeployment?.deployedAt.getTime() ?? 0,
    cell: (app) => <LiveDeployment app={app} />,
  },
  {
    key: "created",
    header: "Created",
    sortValue: (app) => app.createdAt.getTime(),
    cell: (app) => <RelativeTime date={app.createdAt} fallback="Unknown" />,
  },
];

function Apps() {
  const { org } = Route.useParams();
  const apps = useApps(org);
  const { view = "grid" } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <PageHeader
        title="Apps"
        description="Each app is served at its own hostname and sleeps when nobody is using it."
        actions={
          apps.length > 0 && (
            <ViewSwitcher
              options={["grid", "list", "table"]}
              value={view}
              onValueChange={(next) =>
                navigate({ search: { view: next }, replace: true })
              }
            />
          )
        }
      />
      <Collection
        view={view}
        label="Apps"
        items={apps}
        getKey={(app) => app.id}
        empty={
          <CollectionEmpty
            icon={<BoxesIcon />}
            title="No apps yet"
            description="Create an app, then deploy an image to it from the dashboard or the quilt CLI."
          />
        }
        grid={(app) => (
          <Card className="h-full gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <AppAvatar app={app} size="lg" />
              <AppStatusBadge status={app.status} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{app.name}</span>
              <Hostname app={app} />
            </div>
            <div className="mt-auto text-muted-foreground text-sm">
              <LiveDeployment app={app} />
            </div>
          </Card>
        )}
        list={(app) => (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <AppAvatar app={app} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{app.name}</span>
              <Hostname app={app} />
            </div>
            <span className="text-muted-foreground">
              <LiveDeployment app={app} />
            </span>
            <AppStatusBadge status={app.status} />
          </div>
        )}
        table={columns}
      />
    </>
  );
}

function AppAvatar({ app, size }: { app: App; size?: "lg" }) {
  return (
    <Avatar
      className="rounded-md after:rounded-md"
      size={size}
      aria-hidden="true"
    >
      <AvatarFallback className="rounded-md">
        {app.name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function Hostname({ app }: { app: App }) {
  return (
    <a
      href={`https://${app.hostname}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-fit min-w-0 items-center gap-1 text-muted-foreground text-sm hover:text-foreground hover:underline"
    >
      <span className="truncate">{app.hostname}</span>
      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function LiveDeployment({ app }: { app: App }) {
  if (!app.liveDeployment) {
    return <span className="text-muted-foreground">No deployments yet</span>;
  }
  return (
    <span>
      v{app.liveDeployment.version} ·{" "}
      <RelativeTime date={app.liveDeployment.deployedAt} fallback="Unknown" />
    </span>
  );
}
