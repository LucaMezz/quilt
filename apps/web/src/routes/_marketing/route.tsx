import { createFileRoute, Outlet } from "@tanstack/react-router";

import Header from "@/components/header";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <Header />
      <Outlet />
    </div>
  );
}
