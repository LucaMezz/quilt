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
          {phases.map(({ name, status, current, items }) => (
            <li
              key={name}
              className={cn(
                "rounded-xl border bg-card p-6",
                current && "border-primary/60 ring-1 ring-primary/20",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{name}</h3>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs",
                    current
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {status}
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-muted-foreground text-sm">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
