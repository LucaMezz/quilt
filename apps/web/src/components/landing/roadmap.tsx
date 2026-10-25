import { Badge } from "@quilt/ui/components/badge";
import { BlurFade } from "@quilt/ui/components/blur-fade";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@quilt/ui/components/card";
import { cn } from "@quilt/ui/lib/utils";
import { SectionHeading } from "./section-heading";

const phases = [
  {
    name: "Prototype",
    status: "In progress",
    current: true,
    items: [
      "k3s across two servers",
      "Scale to zero and wake on request",
      "One-command server join",
      "Stateless apps from an image or Dockerfile",
      "Zone-label placement",
      "Organizations, roles and API keys",
      "API, CLI and web dashboard",
    ],
  },
  {
    name: "v1",
    status: "Next",
    current: false,
    items: [
      "Sleeping PR previews and scheduled sleep",
      "Savings dashboard",
      "Wake protection for bots",
      "Instant rollback and safe self-update",
      "Postgres with HA and S3 backups",
      "Drain a server, audit log and roles",
      "Importers from Coolify, Dokploy and Compose",
    ],
  },
  {
    name: "v2",
    status: "Later",
    current: false,
    items: [
      "Replicated volumes with durability levels",
      "Backups with automatic test restores",
      "Learned keep-warm before usual traffic",
      "Resource quotas per organization",
      "Usage-based billing from reserved resources",
      "Desktop app",
    ],
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-16 border-t">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="Roadmap"
          title="Stateless first. Stateful when it is proven."
          description="Each phase starts only once the previous one meets its success criteria, measured and written up in the open."
        />

        <ol className="mt-12 grid gap-4 lg:grid-cols-3">
          {phases.map(({ name, status, current, items }, index) => (
            <li key={name}>
              <BlurFade
                inView
                direction="up"
                delay={index * 0.07}
                className="h-full"
              >
                <Card
                  className={cn(
                    "h-full gap-4 [--card-spacing:--spacing(6)]",
                    current && "ring-primary/60",
                  )}
                >
                  <CardHeader>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <CardAction>
                      <Badge variant={current ? "default" : "outline"}>
                        {status}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      {items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </BlurFade>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
