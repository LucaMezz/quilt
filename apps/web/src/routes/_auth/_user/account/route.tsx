import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_user/account")({
  component: AccountLayout,
  staticData: { breadcrumb: "Account" },
});

function AccountLayout() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-[1.75rem] tracking-tight">Account</h1>
        <p className="text-muted-foreground text-sm">
          Your profile and how tools sign in as you.
        </p>
      </div>
      <Outlet />
    </div>
  );
}
