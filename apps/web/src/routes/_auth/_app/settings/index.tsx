import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@quilt/ui/components/avatar";
import { createFileRoute } from "@tanstack/react-router";

import { SectionCard } from "@/components/settings/section-card";
import { initials } from "@/lib/initials";

export const Route = createFileRoute("/_auth/_app/settings/")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const { session } = Route.useRouteContext();
  const { user } = session;

  return (
    <SectionCard
      title="Profile"
      description="How you appear to the people you work with."
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback className="text-lg">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <dl className="grid gap-1 text-sm">
          <dt className="sr-only">Name</dt>
          <dd className="font-medium text-base">{user.name}</dd>
          <dt className="sr-only">Email</dt>
          <dd className="text-muted-foreground">{user.email}</dd>
        </dl>
      </div>
    </SectionCard>
  );
}
