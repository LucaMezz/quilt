import { Badge } from "@quilt/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@quilt/ui/components/card";
import { cn } from "@quilt/ui/lib/utils";
import { Check, Moon, Power } from "lucide-react";

import { SectionHeading } from "./section-heading";

const timeline = [
  {
    state: "Sleeping",
    detail: "No pods running. The app uses no memory.",
    tone: "muted",
  },
  {
    state: "Request arrives",
    detail: "The entry proxy catches docs.example.dev and holds the request.",
    tone: "active",
  },
  {
    state: "Waking",
    detail: "Knative starts the app on whichever node the scheduler picks.",
    tone: "active",
  },
  {
    state: "Running",
    detail: "The held request is answered. Later requests go straight through.",
    tone: "primary",
  },
  {
    state: "Idle again",
    detail:
      "After the idle timeout the app scales back to zero and stops accruing usage.",
    tone: "muted",
  },
] as const;

const awake = new Set([2, 9, 17]);
const densityApps = Array.from({ length: 24 }, (_, index) => ({
  id: `app-${index}`,
  isAwake: awake.has(index),
}));

const modes = [
  {
    icon: Moon,
    title: "Scale to zero",
    tag: "Default",
    body: "For staging, PR previews, internal tools and anything else that is quiet most of the day. The app sleeps when idle and wakes on the next request.",
  },
  {
    icon: Power,
    title: "Always on",
    tag: "Opt in",
    body: "For high-traffic apps that can't afford a cold start, or apps that don't suit sleeping, like workers and long-lived connections. Keep a minimum number of instances running at all times.",
  },
];

const comingNext = [
  "Wake protection so crawlers and health checks don't wake apps",
  "Scheduled sleep for staging on nights and weekends",
  "A savings view with hours asleep and wake times per app",
];

export function ScaleToZero() {
  return (
    <section id="scale-to-zero" className="scroll-mt-16 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Scale to zero"
              title="Quiet apps sleep. Busy apps stay on."
              description="Scale to zero is a per-app choice. Apps that sit idle release their resources until someone needs them, so they stop taking room on your servers and stop appearing on the bill. Apps that need to be ready at all times simply opt out."
            />

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>One server, many apps</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-12 gap-1.5">
                {densityApps.map(({ id, isAwake }) => (
                  <div
                    key={id}
                    className={cn(
                      "aspect-square rounded-sm",
                      isAwake
                        ? "bg-primary shadow-[0_0_12px_var(--primary)]"
                        : "bg-muted",
                    )}
                  />
                ))}
              </CardContent>
              <CardFooter className="text-muted-foreground">
                <p>
                  Illustration: 24 apps on one server with 3 awake. Density
                  benchmarks are part of the prototype and will be published.
                </p>
              </CardFooter>
            </Card>

            <ul className="mt-8 space-y-2 text-sm">
              <li className="font-medium">Coming next</li>
              {comingNext.map((item) => (
                <li key={item} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ol className="relative space-y-6 rounded-2xl border bg-card p-6 sm:p-8">
            {timeline.map(({ state, detail, tone }, index) => (
              <li key={state} className="relative flex gap-4">
                {index < timeline.length - 1 && (
                  <span className="absolute top-6 left-[11px] h-[calc(100%+0.5rem)] w-px bg-border" />
                )}
                <span
                  className={cn(
                    "relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                    tone === "primary" &&
                      "border-primary bg-primary text-primary-foreground",
                    tone === "active" && "border-primary/50 bg-primary/10",
                    tone === "muted" && "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      tone === "muted"
                        ? "bg-muted-foreground/50"
                        : "bg-current",
                      tone === "active" && "bg-primary",
                    )}
                  />
                </span>
                <div>
                  <p className="font-medium text-sm">{state}</p>
                  <p className="mt-1 text-muted-foreground text-sm">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {modes.map(({ icon: Icon, title, tag, body }) => (
            <Card key={title} className="[--card-spacing:--spacing(6)]">
              <CardHeader>
                <h3 className="flex items-center gap-2 font-medium text-base">
                  <Icon className="size-4 text-primary" />
                  {title}
                </h3>
                <CardDescription className="text-sm">{body}</CardDescription>
                <CardAction>
                  <Badge variant="outline">{tag}</Badge>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
