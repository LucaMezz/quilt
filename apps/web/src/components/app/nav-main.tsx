import { Badge } from "@quilt/ui/components/badge";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@quilt/ui/components/sidebar";
import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router";
import { Fragment } from "react";

type NavItem = {
  title: string;
  icon: React.ReactNode;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
  exact?: boolean;
};

export type NavSection = { label?: string; items: readonly NavItem[] };

export function NavMain({ sections }: { sections: NavSection[] }) {
  const matchRoute = useMatchRoute();

  return sections.map((section, index) => (
    <Fragment key={section.label ?? index}>
      {index > 0 && <SidebarSeparator />}
      <SidebarGroup>
        {section.label && (
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
        )}
        <SidebarMenu>
          {section.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.to ? (
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={Boolean(
                    matchRoute({
                      to: item.to,
                      params: item.params,
                      fuzzy: !item.exact,
                    }),
                  )}
                  render={<Link to={item.to} params={item.params} />}
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
                  <SidebarMenuBadge className="px-0">
                    <Badge variant="tag">Soon</Badge>
                  </SidebarMenuBadge>
                </>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </Fragment>
  ));
}
