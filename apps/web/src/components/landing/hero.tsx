import { BlurFade } from "@quilt/ui/components/blur-fade";
import { buttonVariants } from "@quilt/ui/components/button";
import { cn } from "@quilt/ui/lib/utils";
import { Info, Star } from "lucide-react";

import { githubUrl } from "./links";
import { ScreenshotPlaceholder } from "./screenshot-placeholder";
import { TryItLink } from "./try-it-link";

const headline = "The open source PaaS for your own servers";
const tagline =
  "quilt is a platform you install on your own servers. It pools them into one platform where every team or customer gets an organization to deploy apps in, apps can sleep when idle, and usage is billed by the resources each running app reserves.";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%)]" />
      <div className="mask-[radial-gradient(ellipse_at_top,black,transparent_70%)] pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40" />

      <div className="container mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28">
        <BlurFade inView direction="up" delay={0}>
          <a
            href={githubUrl}
            className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-muted-foreground text-xs backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Open source · self-hosted · alpha
          </a>
        </BlurFade>

        <BlurFade inView direction="up" delay={0.07}>
          <h1 className="max-w-3xl text-balance font-semibold text-4xl tracking-tight sm:text-6xl">
            {headline}
          </h1>
        </BlurFade>
        <BlurFade inView direction="up" delay={0.14}>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            {tagline}
          </p>
        </BlurFade>

        <BlurFade inView direction="up" delay={0.21}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <TryItLink />
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
        </BlurFade>

        <BlurFade inView direction="up" delay={0.28}>
          <p className="mt-6 flex max-w-xl items-start gap-2 text-left text-muted-foreground text-xs">
            <Info className="mt-px size-3.5 shrink-0" />
            This is the default home page that ships with quilt. Anyone hosting
            quilt can replace it with their own, and on the live demo you can
            sign in and use the platform for real.
          </p>
        </BlurFade>

        <BlurFade inView direction="up" delay={0.35} className="w-full">
          <div className="mt-12 w-full rounded-2xl border bg-card/60 p-2 shadow-2xl backdrop-blur">
            <ScreenshotPlaceholder label="Dashboard screenshot: an organization's apps with running and sleeping states" />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
