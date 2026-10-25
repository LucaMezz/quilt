import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@quilt/ui/components/card";
import { Building2, Rocket, Server } from "lucide-react";

import { SectionHeading } from "./section-heading";

const steps = [
  {
    icon: Server,
    title: "Pool your servers",
    body: "Install on your first server and join the rest with one command each. Any Linux server works, from a cloud provider or your own racks.",
  },
  {
    icon: Building2,
    title: "Create organizations",
    body: "Give each department, team or customer its own organization with members, roles and scoped API keys.",
  },
  {
    icon: Rocket,
    title: "Let them deploy",
    body: "Teams push an image and get a hostname. quilt picks the server, sleeps idle apps and meters what each one reserves.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From a fleet of servers to a self-service platform"
        />

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title}>
              <Card className="h-full [--card-spacing:--spacing(6)]">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardAction className="font-mono text-muted-foreground text-xs">
                    0{index + 1}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-base">{title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
