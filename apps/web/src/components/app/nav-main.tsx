import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@quilt/ui/components/sidebar";
import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    to?: LinkProps["to"];
  }[];
}) {
  const matchRoute = useMatchRoute();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.to ? (
              <SidebarMenuButton
                tooltip={item.title}
                isActive={Boolean(matchRoute({ to: item.to, fuzzy: true }))}
                render={<Link to={item.to} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : (
              <>
                <SidebarMenuButton
                  tooltip={`${item.title} (coming soon)`}
                  aria-disabled
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>Soon</SidebarMenuBadge>
              </>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
