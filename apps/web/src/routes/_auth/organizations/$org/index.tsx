import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/app/page-header";
import { useOrganization } from "@/lib/organizations/use-organizations";

export const Route = createFileRoute("/_auth/organizations/$org/")({
  component: Dashboard,
  staticData: { breadcrumb: "Dashboard" },
});

function Dashboard() {
  const { org } = Route.useParams();
  const organization = useOrganization(org);

  return (
    <>
      <PageHeader
        title={organization?.name ?? "Dashboard"}
        description="An overview of this organization's apps and servers."
      />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50" />
    </>
  );
}
