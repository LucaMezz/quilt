import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Backdrop } from "@/components/backdrop";
import { DeviceAuthorization } from "@/components/device-authorization";

export const Route = createFileRoute("/_auth/device")({
  validateSearch: z.object({
    user_code: z
      .union([z.string(), z.number()])
      .transform(String)
      .optional()
      .catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user_code } = Route.useSearch();

  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10">
      <Backdrop />
      <div className="w-full max-w-sm md:max-w-md">
        <DeviceAuthorization
          initialCode={user_code}
          onVerify={async () => ({ clientId: "quilt CLI", scopes: [] })}
          onApprove={async () => {}}
          onDeny={async () => {}}
        />
      </div>
    </div>
  );
}
