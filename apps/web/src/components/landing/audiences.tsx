import { Badge } from "@quilt/ui/components/badge";
import { BlurFade } from "@quilt/ui/components/blur-fade";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@quilt/ui/components/card";
import { cn } from "@quilt/ui/lib/utils";
import { Building2, Check, User, Users } from "lucide-react";
import { SectionHeading } from "./section-heading";

const audiences = [
  {
    icon: Building2,
    title: "Businesses",
    highlight: true,
    body: "Run an internal platform for every department, or sell hosting to your own customers, on servers you control.",
    points: [
      "An organization per team or customer",
      "Usage-based billing from reserved resources",
      "Roles, scoped API keys and an audit trail",
    ],
  },
  {
    icon: Users,
    title: "Teams",
    highlight: false,
    body: "Pool a few office or cloud servers into one place to ship internal tools without a platform team.",
    points: [
      "Staging and PR previews that sleep",
      "Shared dashboard and CLI",
      "No Kubernetes knowledge needed",
    ],
  },
  {
    icon: User,
    title: "Solo developers",
    highlight: false,
    body: "Put spare VPSes to work. Idle side projects sleep, so one cheap server holds dozens of them.",
    points: [
      "Any Linux server, x86 or ARM",
      "A hostname for every project",
      "Free and open source",
    ],
  },
];

export function Audiences() {
  return (
    <section id="who-its-for" className="scroll-mt-16 border-t">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="Who it's for"
          title="Built for a business. Just as useful for a team or on your own."
          description="The same platform scales down from a company's fleet to a single spare server. Organizations, roles and billing are there when you need them and out of the way when you don't."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {audiences.map(
            ({ icon: Icon, title, highlight, body, points }, index) => (
              <BlurFade inView direction="up" key={title} delay={index * 0.07}>
                <Card
                  className={cn(
                    "h-full [--card-spacing:--spacing(6)]",
                    highlight && "ring-primary/60",
                  )}
                >
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    {highlight && (
                      <CardAction>
                        <Badge>Main focus</Badge>
                      </CardAction>
                    )}
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium text-base">{title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm">{body}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-2 text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </BlurFade>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
