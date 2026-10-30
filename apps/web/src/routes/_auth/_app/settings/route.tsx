import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SettingsNav } from "@/components/settings/settings-nav";

export const Route = createFileRoute("/_auth/_app/settings")({
  component: SettingsLayout,
  staticData: { breadcrumb: "Settings" },
});

function SettingsLayout() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and how tools sign in as you.
        </p>
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <SettingsNav className="md:w-48 md:shrink-0" />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
