import type { ReactNode } from "react";

import { Logo } from "./logo";

export function SiteHeader({
  nav,
  actions,
}: {
  nav?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Logo />
          {nav}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}
