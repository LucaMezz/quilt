import { SidebarInset, SidebarProvider } from "@quilt/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({
        to: "/login",
      });
    }
    return { session };
  },
});

function AuthLayout() {
  const { session } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <AppHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
