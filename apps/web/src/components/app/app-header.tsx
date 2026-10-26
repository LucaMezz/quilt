import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@quilt/ui/components/breadcrumb";
import { Separator } from "@quilt/ui/components/separator";
import { SidebarTrigger } from "@quilt/ui/components/sidebar";
import { useMatches } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";

export function AppHeader() {
  const title = useMatches({
    select: (matches) =>
      matches.findLast((match) => match.staticData.breadcrumb)?.staticData
        .breadcrumb,
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      {title && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </header>
  );
}
