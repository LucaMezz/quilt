import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@quilt/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, KeyRoundIcon, UserIcon } from "lucide-react";

import { NavMain } from "@/components/app/nav-main";
import { NavUser } from "@/components/app/nav-user";

const sections = [
  {
    label: "Account",
    items: [
      { title: "Profile", icon: <UserIcon />, to: "/account", exact: true },
      { title: "API keys", icon: <KeyRoundIcon />, to: "/account/api-keys" },
    ],
  },
] as const;

export function AccountSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: React.ComponentProps<typeof NavUser>["user"];
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to dashboard"
              render={<Link to="/dashboard" />}
            >
              <ArrowLeftIcon />
              <span>Back to dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
