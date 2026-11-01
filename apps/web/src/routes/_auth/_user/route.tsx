import { SidebarInset, SidebarProvider } from "@quilt/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "@/components/app/app-header";
import { UserSidebar } from "@/components/user/user-sidebar";
import { useProfile } from "@/lib/profile/use-profile";

export const Route = createFileRoute("/_auth/_user")({
  component: UserLayout,
});

function UserLayout() {
  const { session } = Route.useRouteContext();
  const profile = useProfile(session.user);

  return (
    <SidebarProvider>
      <UserSidebar user={profile} />
      <SidebarInset>
        <AppHeader />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 md:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
