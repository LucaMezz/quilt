import { createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    // This is the only ourside input to the component. To test this,
    // we want to control the response we get from this.
    //
    // So we replace authClient with a fake whose answer we choose.
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { session };
  },
});
