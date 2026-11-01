import { createFileRoute } from "@tanstack/react-router";

import { ProfileName } from "@/components/settings/profile-name";
import { ProfilePicture } from "@/components/settings/profile-picture";
import { useProfile } from "@/lib/profile/use-profile";

export const Route = createFileRoute("/_auth/_user/account/")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const { session } = Route.useRouteContext();
  const profile = useProfile(session.user);

  return (
    <div className="flex flex-col gap-6">
      <ProfilePicture profile={profile} />
      <ProfileName profile={profile} />
    </div>
  );
}
