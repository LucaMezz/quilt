import { BlurFade } from "@quilt/ui/components/blur-fade";
import { Card, CardContent } from "@quilt/ui/components/card";
import { Lock, ScrollText, ShieldCheck, Unlock } from "lucide-react";
import { SectionHeading } from "./section-heading";

const principles = [
  {
    icon: Lock,
    title: "No root SSH",
    body: "A least-privilege agent joins each server instead of the platform holding root keys to your fleet.",
  },
  {
    icon: ShieldCheck,
    title: "Honest durability",
    body: "Every volume says what it survives, instead of hiding the risk behind a green checkmark.",
  },
  {
    icon: ScrollText,
    title: "An audit trail from day one",
    body: "Who deployed, moved or woke what in each organization, including the actions quilt takes on its own.",
  },
  {
    icon: Unlock,
    title: "No lock-in",
    body: "Apache-2.0 licensed and built on standard k3s and Knative. Your servers stay yours.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="scroll-mt-16 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="Principles"
          title="Built to run a business on"
          description="A platform your teams and customers depend on has to be careful with your servers and honest about your data. These are design commitments, not features bolted on later."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map(({ icon: Icon, title, body }, index) => (
            <BlurFade inView direction="up" key={title} delay={index * 0.07}>
              <Card className="h-full [--card-spacing:--spacing(6)]">
                <CardContent>
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 font-medium text-base">{title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{body}</p>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
