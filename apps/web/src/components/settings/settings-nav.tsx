import { cn } from "@quilt/ui/lib/utils";
import { Link, type LinkProps } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";

const items: {
  label: string;
  to: LinkProps["to"];
  icon: React.ReactNode;
  exact?: boolean;
}[] = [{ label: "Profile", to: "/settings", icon: <UserIcon />, exact: true }];

export function SettingsNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Settings" className={className}>
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground text-sm outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0",
                "aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground",
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
