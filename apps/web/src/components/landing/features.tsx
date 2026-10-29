import { BlurFade } from "@quilt/ui/components/blur-fade";
import { Building2, Gauge, Globe, KeyRound, Moon, Shuffle } from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: Building2,
    title: "Organizations",
    body: "Every team or customer gets its own organization with its own apps and members, and every request names the one it acts on.",
  },
  {
    icon: KeyRound,
    title: "Roles and API keys",
    body: "Owners, admins and members get the access their role allows. Scoped API keys use the same roles, so CI gets only what it needs.",
  },
  {
    icon: Gauge,
    title: "Usage metering",
    body: "Usage is measured by the CPU and memory each app reserves while running, per app and per organization.",
  },
  {
    icon: Moon,
    title: "Scale to zero, per app",
    body: "Idle apps can sleep and release their reservation until the next request. Turn it off for busy apps that should always be running.",
  },
  {
    icon: Shuffle,
    title: "Automatic placement",
    body: "Nobody picks a server. quilt places every app on a node with room, honours zone labels like eu, and moves apps off failed nodes.",
  },
  {
    icon: Globe,
    title: "A hostname for every app",
    body: "Each app gets its own URL under one wildcard record, and it keeps working when the app moves.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="Platform"
          title="Everything a business expects from a PaaS, on your own hardware"
          description="Multi-tenancy, access control and metering are part of the platform, not add-ons. Underneath, k3s and Knative do the work, and nobody has to touch a manifest."
        />

        <BlurFade
          inView
          direction="up"
          className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background p-6">
              <Icon className="size-5 text-primary" />
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{body}</p>
            </div>
          ))}
        </BlurFade>
      </div>
    </section>
  );
}
