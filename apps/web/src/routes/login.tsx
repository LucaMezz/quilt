import { createFileRoute } from "@tanstack/react-router";

import { Backdrop } from "@/components/backdrop";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10">
      <Backdrop />
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
