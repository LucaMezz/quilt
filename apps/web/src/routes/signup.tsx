import { createFileRoute } from "@tanstack/react-router";

import { Backdrop } from "@/components/backdrop";
import { SignupForm } from "@/components/signup-form";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative isolate flex flex-col items-center justify-center overflow-hidden p-6 md:p-10">
      <Backdrop />
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}
