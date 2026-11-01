import { createFileRoute, Outlet } from "@tanstack/react-router";

import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_auth/_user/account")({
  component: AccountLayout,
  staticData: { breadcrumb: "Account" },
});

function AccountLayout() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Account"
        description="Your profile and how tools sign in as you."
      />
      <Outlet />
    </div>
  );
}
