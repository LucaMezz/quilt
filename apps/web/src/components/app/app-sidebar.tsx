import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@quilt/ui/components/sidebar";
import {
  Boxes,
  Building2,
  LayoutDashboard,
  Rocket,
  Server,
  Settings2,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

const teams = [
  {
    name: "My organization",
    logo: <Building2 />,
    plan: "Organization",
  },
];

const sections = [
  {
    label: "General",
    items: [
      { title: "Dashboard", icon: <LayoutDashboard />, to: "/dashboard" },
      { title: "Apps", icon: <Boxes /> },
      { title: "Servers", icon: <Server /> },
      { title: "Deployments", icon: <Rocket /> },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", icon: <Settings2 />, to: "/settings" }],
  },
] as const;

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: React.ComponentProps<typeof NavUser>["user"];
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={[...sections]} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
