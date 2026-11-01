import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@quilt/ui/components/sidebar";
import { Boxes, LayoutDashboard, Rocket, Server, Settings } from "lucide-react";

import type { Organization } from "@/lib/organizations/use-organizations";

import { NavMain, type NavSection } from "./nav-main";
import { NavUser } from "./nav-user";
import { OrganizationSwitcher } from "./organization-switcher";

export function AppSidebar({
  organization,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  organization: Organization;
  user: React.ComponentProps<typeof NavUser>["user"];
}) {
  const sections: NavSection[] = [
    {
      label: "General",
      items: [
        {
          title: "Dashboard",
          icon: <LayoutDashboard />,
          to: "/organizations/$org",
          params: { org: organization.slug },
          exact: true,
        },
        {
          title: "Apps",
          icon: <Boxes />,
          to: "/organizations/$org/apps",
          params: { org: organization.slug },
        },
        { title: "Servers", icon: <Server /> },
        { title: "Deployments", icon: <Rocket /> },
      ],
    },
    {
      label: "Organization",
      items: [
        {
          title: "Settings",
          icon: <Settings />,
          to: "/organizations/$org/settings",
          params: { org: organization.slug },
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher current={organization} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={sections} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
