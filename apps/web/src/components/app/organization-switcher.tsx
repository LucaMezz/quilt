import { Avatar, AvatarFallback } from "@quilt/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@quilt/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@quilt/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  LayoutGridIcon,
  PlusIcon,
} from "lucide-react";

import {
  type Organization,
  useOrganizations,
} from "@/lib/organizations/use-organizations";

const roleLabels = { owner: "Owner", admin: "Admin", member: "Member" };

function Initial({
  organization,
  className,
}: {
  organization: Organization;
  className?: string;
}) {
  return (
    <Avatar
      className={`rounded-md after:rounded-md ${className ?? ""}`}
      aria-hidden="true"
    >
      <AvatarFallback className="rounded-md">
        {organization.name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}

export function OrganizationSwitcher({ current }: { current: Organization }) {
  const { isMobile } = useSidebar();
  const organizations = useOrganizations();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={`${current.name}, switch organization`}
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Initial organization={current} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{current.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {roleLabels[current.role]}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  className="gap-2 p-2"
                  render={
                    <Link
                      to="/organizations/$org"
                      params={{ org: organization.slug }}
                      aria-current={
                        organization.id === current.id ? "page" : undefined
                      }
                    />
                  }
                >
                  <Initial organization={organization} className="size-6" />
                  <span className="flex-1 truncate">{organization.name}</span>
                  {organization.id === current.id && (
                    <CheckIcon aria-hidden="true" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 p-2"
                render={<Link to="/organizations" />}
              >
                <LayoutGridIcon aria-hidden="true" />
                All organizations
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 p-2"
                render={<Link to="/organizations/new" />}
              >
                <PlusIcon aria-hidden="true" />
                New organization
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
