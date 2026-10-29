import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Backdrop } from "@/components/backdrop";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();

  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10">
      <Backdrop />
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm redirect={redirect} />
      </div>
    </div>
  );
}
