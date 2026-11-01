import { Avatar, AvatarFallback } from "@quilt/ui/components/avatar";
import { Badge } from "@quilt/ui/components/badge";
import { Card } from "@quilt/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

import {
  type Role,
  useOrganizations,
} from "@/lib/organizations/use-organizations";

export const Route = createFileRoute("/_auth/_user/organizations")({
  component: Organizations,
  staticData: { breadcrumb: "Organizations" },
});

const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

function Organizations() {
  const organizations = useOrganizations();

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-[1.75rem] tracking-tight">
          Organizations
        </h1>
        <p className="text-muted-foreground text-sm">
          Each organization has its own apps, servers and members. Open one to
          manage it.
        </p>
      </div>
      <Card className="p-2">
        <ul className="flex flex-col">
          {organizations.map((organization) => (
            <li key={organization.id}>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-md px-2 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="rounded-md" aria-hidden="true">
                  <AvatarFallback className="rounded-md">
                    {organization.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate font-medium">
                  {organization.name}
                </span>
                <Badge variant="secondary">
                  {roleLabels[organization.role]}
                </Badge>
                <ChevronRightIcon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
