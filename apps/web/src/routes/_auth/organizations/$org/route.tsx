import { buttonVariants } from "@quilt/ui/components/button";
import { SidebarInset, SidebarProvider } from "@quilt/ui/components/sidebar";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Building2Icon } from "lucide-react";

import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { CollectionEmpty } from "@/components/collection/collection-empty";
import { useOrganization } from "@/lib/organizations/use-organizations";
import { useProfile } from "@/lib/profile/use-profile";

export const Route = createFileRoute("/_auth/organizations/$org")({
  component: OrganizationLayout,
});

function OrganizationLayout() {
  const { session } = Route.useRouteContext();
  const { org } = Route.useParams();
  const profile = useProfile(session.user);
  const organization = useOrganization(org);

  if (!organization) return <OrganizationNotFound />;

  return (
    <SidebarProvider>
      <AppSidebar organization={organization} user={profile} />
      <SidebarInset>
        <AppHeader />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 md:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function OrganizationNotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <CollectionEmpty
          icon={<Building2Icon />}
          title="Organization not found"
          description="It may have been deleted or renamed, or you may not be a member of it."
          action={
            <Link to="/organizations" className={buttonVariants()}>
              All organizations
            </Link>
          }
        />
      </div>
    </main>
  );
}
