import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
  staticData: { breadcrumb: "Dashboard" },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="font-semibold text-2xl tracking-tight">
        Welcome back, {session.user.name}
      </h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
