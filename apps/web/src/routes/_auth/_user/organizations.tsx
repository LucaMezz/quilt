import { Avatar, AvatarFallback } from "@quilt/ui/components/avatar";
import { Badge } from "@quilt/ui/components/badge";
import { Card } from "@quilt/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2Icon, ChevronRightIcon } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Collection } from "@/components/collection/collection";
import { CollectionEmpty } from "@/components/collection/collection-empty";
import type { Column } from "@/components/collection/collection-table";
import { ViewSwitcher } from "@/components/collection/view-switcher";
import { viewSearch } from "@/components/collection/views";
import {
  type Role,
  useOrganizations,
} from "@/lib/organizations/use-organizations";

export const Route = createFileRoute("/_auth/_user/organizations")({
  component: Organizations,
  validateSearch: viewSearch,
  staticData: { breadcrumb: "Organizations" },
});

type Organization = ReturnType<typeof useOrganizations>[number];

const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

const linkClass =
  "outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-ring";

const columns: Column<Organization>[] = [
  {
    key: "name",
    header: "Name",
    rowHeader: true,
    sortValue: (organization) => organization.name,
    cell: (organization) => (
      <span className="flex items-center gap-3">
        <OrganizationAvatar organization={organization} />
        <OrganizationLink organization={organization} />
      </span>
    ),
  },
  {
    key: "role",
    header: "Your role",
    sortValue: (organization) => organization.role,
    cell: (organization) => <RoleBadge role={organization.role} />,
  },
];

function Organizations() {
  const organizations = useOrganizations();
  const { view = "grid" } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Each organization has its own apps, servers and members. Open one to manage it."
        actions={
          organizations.length > 0 && (
            <ViewSwitcher
              options={["grid", "list", "table"]}
              value={view}
              onValueChange={(next) =>
                navigate({ search: { view: next }, replace: true })
              }
            />
          )
        }
      />
      <Collection
        view={view}
        label="Organizations"
        items={organizations}
        getKey={(organization) => organization.id}
        empty={
          <CollectionEmpty
            icon={<Building2Icon />}
            title="No organizations yet"
            description="Organizations hold your apps, servers and members. Once you create or join one it appears here."
          />
        }
        grid={(organization) => (
          <Card className="h-full gap-4 p-5 transition-colors has-[a:hover]:bg-muted/50">
            <div className="flex items-start justify-between gap-3">
              <OrganizationAvatar organization={organization} size="lg" />
              <RoleBadge role={organization.role} />
            </div>
            <OrganizationLink organization={organization} />
          </Card>
        )}
        list={(organization) => (
          <div className="flex items-center gap-3 px-4 py-3 text-sm transition-colors has-[a:hover]:bg-muted/50">
            <OrganizationAvatar organization={organization} />
            <span className="flex-1 truncate">
              <OrganizationLink organization={organization} />
            </span>
            <RoleBadge role={organization.role} />
            <ChevronRightIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}
        table={columns}
      />
    </>
  );
}

function OrganizationLink({ organization }: { organization: Organization }) {
  return (
    <Link to="/dashboard" className={`font-medium ${linkClass}`}>
      {organization.name}
    </Link>
  );
}

function OrganizationAvatar({
  organization,
  size,
}: {
  organization: Organization;
  size?: "lg";
}) {
  return (
    <Avatar
      className="rounded-md after:rounded-md"
      size={size}
      aria-hidden="true"
    >
      <AvatarFallback className="rounded-md">
        {organization.name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return <Badge variant="secondary">{roleLabels[role]}</Badge>;
}
