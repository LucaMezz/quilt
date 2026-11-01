import { SidebarInset, SidebarProvider } from "@quilt/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { AppHeader } from "@/components/app/app-header";
import { useProfile } from "@/lib/profile/use-profile";

export const Route = createFileRoute("/_auth/account")({
  component: AccountLayout,
  staticData: { breadcrumb: "Account" },
});

function AccountLayout() {
  const { session } = Route.useRouteContext();
  const profile = useProfile(session.user);

  return (
    <SidebarProvider>
      <AccountSidebar user={profile} />
      <SidebarInset>
        <AppHeader />
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-4 md:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-[1.75rem] tracking-tight">
              Account
            </h1>
            <p className="text-muted-foreground text-sm">
              Your organizations, your profile and how tools sign in as you.
            </p>
          </div>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
