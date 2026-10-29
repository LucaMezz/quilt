import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Backdrop } from "@/components/backdrop";
import { DeviceAuthorization } from "@/components/device-authorization";
import { authClient } from "@/lib/auth-client";
import { toDeviceRequest } from "@/lib/device-request";

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
          onVerify={async (userCode) => {
            const { data, error } = await authClient.device({
              query: { user_code: userCode },
            });
            if (error) throw new Error(error.error_description);
            return toDeviceRequest(data);
          }}
          onApprove={async (userCode) => {
            const { error } = await authClient.device.approve({ userCode });
            if (error) throw new Error(error.error_description);
          }}
          onDeny={async (userCode) => {
            const { error } = await authClient.device.deny({ userCode });
            if (error) throw new Error(error.error_description);
          }}
        />
      </div>
    </div>
  );
}
