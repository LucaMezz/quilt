import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@quilt/ui/components/avatar";
import { cn } from "@quilt/ui/lib/utils";

import type { Organization } from "@/lib/organizations/use-organizations";

export function OrganizationAvatar({
  organization,
  size,
  className,
}: {
  organization: Pick<Organization, "name" | "logo">;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar
      className={cn("rounded-md after:rounded-md", className)}
      size={size}
      aria-hidden="true"
    >
      {organization.logo && (
        <AvatarImage
          src={organization.logo}
          alt=""
          className="rounded-md object-cover"
        />
      )}
      <AvatarFallback className="rounded-md">
        {organization.name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
