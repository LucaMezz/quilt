import { buttonVariants } from "@quilt/ui/components/button";
import { Skeleton } from "@quilt/ui/components/skeleton";
import { cn } from "@quilt/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function TryItLink() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-44" />;
  }

  return (
    <Link
      to={session ? "/dashboard" : "/login"}
      className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
    >
      {session ? "Open dashboard" : "Sign in and try it"}
      <ArrowRight data-icon="inline-end" />
    </Link>
  );
}
