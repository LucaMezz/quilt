import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@quilt/ui/components/sidebar";
import { Building2Icon, KeyRoundIcon, UserIcon } from "lucide-react";

import { NavMain } from "@/components/app/nav-main";
import { NavUser } from "@/components/app/nav-user";
import { Logo } from "@/components/logo";

const sections = [
  {
    label: "Account",
    items: [
      {
        title: "Organizations",
        icon: <Building2Icon />,
        to: "/account/organizations",
      },
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
        <Logo className="h-8 overflow-hidden px-2" />
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
