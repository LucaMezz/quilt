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

const navMain = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard />,
    to: "/dashboard",
  },
  { title: "Apps", icon: <Boxes /> },
  { title: "Servers", icon: <Server /> },
  { title: "Deployments", icon: <Rocket /> },
  { title: "Settings", icon: <Settings2 /> },
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
        <NavMain items={[...navMain]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
