import { SidebarInset, SidebarProvider } from "@quilt/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { useProfile } from "@/lib/profile/use-profile";

export const Route = createFileRoute("/_auth/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { session } = Route.useRouteContext();
  const profile = useProfile(session.user);

  return (
    <SidebarProvider>
      <AppSidebar user={profile} />
      <SidebarInset>
        <AppHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
