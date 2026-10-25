import { cn } from "@quilt/ui/lib/utils";
import { ArrowDown, Database, EyeOff } from "lucide-react";

import { SectionHeading } from "./section-heading";

function Box({
  title,
  detail,
  highlight = false,
}: {
  title: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-4 text-center",
        highlight && "border-primary/60 bg-primary/5",
      )}
    >
      <p className="font-medium text-sm">{title}</p>
      <p className="mt-1 text-muted-foreground text-xs">{detail}</p>
    </div>
  );
}

function Layer({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/40 p-4">
      <p className="mb-3 flex items-center justify-end gap-1.5 text-muted-foreground text-xs">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-2 text-muted-foreground">
      <ArrowDown className="size-4" />
    </div>
  );
}

const decisions = [
  {
    title: "Built on k3s and Knative",
    body: "Proven scheduling and scale-to-zero instead of a custom orchestrator.",
  },
  {
    title: "A small agent on each node",
    body: "Onboarding and idle tracking without handing out root SSH.",
  },
  {
    title: "Wake path in the proxy",
    body: "One wildcard DNS record, so moving an app never changes DNS.",
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="scroll-mt-16 border-t">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="Architecture"
          title="You see apps and servers. Kubernetes stays hidden."
          description="Three core nodes in one region run the control plane. Every other server joins as an agent in a zone, whether it is a cloud VPS or a machine in your own rack."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border bg-card p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Box
                title="Dashboard, CLI and API"
                detail="organizations deploy apps, operators join servers"
              />
              <Box
                title="Entry and wake proxy"
                detail="a hostname for every app; holds requests while apps wake"
              />
            </div>
            <Arrow />
            <Layer
              label="Kubernetes layer, hidden from you"
              icon={<EyeOff className="size-3" />}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Box
                  title="k3s control plane"
                  detail="3 core nodes, one region"
                />
                <Box
                  title="Knative"
                  detail="scales apps to zero, wakes them on request"
                  highlight
                />
                <Box
                  title="Automatic placement"
                  detail="the scheduler picks the server"
                />
              </div>
            </Layer>
            <Arrow />
            <Layer label="Your servers, grouped into zones">
              <div className="grid gap-3 sm:grid-cols-2">
                <Box title="Zone eu" detail="agent nodes from any provider" />
                <Box title="Zone cheap" detail="agent nodes in any region" />
              </div>
            </Layer>
            <Arrow />
            <div className="flex items-center justify-center gap-2 rounded-lg border bg-background p-3 text-muted-foreground text-xs">
              <Database className="size-3.5" />
              S3-compatible backup storage
            </div>
          </div>

          <ul className="space-y-6">
            {decisions.map(({ title, body }) => (
              <li key={title} className="border-primary border-l-2 pl-4">
                <p className="font-medium text-sm">{title}</p>
                <p className="mt-1 text-muted-foreground text-sm">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
