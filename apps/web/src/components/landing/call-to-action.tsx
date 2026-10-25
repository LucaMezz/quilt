import { buttonVariants } from "@quilt/ui/components/button";
import { cn } from "@quilt/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";

import { githubUrl } from "./links";

export function CallToAction() {
  return (
    <section className="border-t">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_65%)]" />
          <h2 className="relative mx-auto max-w-2xl text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
            Run your own platform on servers you already own
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
            quilt is open source and early. Sign in to try it here, install it
            on a few spare servers, and tell us what your business would need to
            switch.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
            >
              Sign in and try it
              <ArrowRight data-icon="inline-end" />
            </Link>
            <a
              href={githubUrl}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 px-5",
              )}
            >
              <Star data-icon="inline-start" />
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
