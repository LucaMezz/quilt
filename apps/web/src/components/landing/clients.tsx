import { Card, CardContent } from "@quilt/ui/components/card";
import { KeyRound, LayoutDashboard, Terminal } from "lucide-react";

import { ScreenshotPlaceholder } from "./screenshot-placeholder";
import { SectionHeading } from "./section-heading";

const clients = [
  {
    icon: LayoutDashboard,
    title: "Web dashboard",
    body: "Switch between organizations and see every app, whether it is running or asleep, and which server it landed on.",
    placeholder: "Dashboard screenshot: app detail with placement and state",
  },
  {
    icon: Terminal,
    title: "quilt CLI",
    body: "A single binary for Linux, macOS and Windows. Sign in once, then deploy and manage apps from the terminal.",
    placeholder: "CLI screenshot: deploying an app from the terminal",
  },
];

export function Clients() {
  return (
    <section id="clients" className="scroll-mt-16 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="Dashboard, CLI and API"
          title="Manage it in the dashboard, automate deploys from CI"
          description="The dashboard and CLI are built on the same documented API. Deploying and managing apps works with scoped API keys, so CI can do it too. Account-level actions, like managing organizations, members and API keys, need a signed-in session from the dashboard or CLI."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {clients.map(({ icon: Icon, title, body, placeholder }) => (
            <Card key={title}>
              <CardContent>
                <ScreenshotPlaceholder
                  label={placeholder}
                  className="aspect-[16/10]"
                />
              </CardContent>
              <CardContent>
                <h3 className="flex items-center gap-2 font-medium text-base">
                  <Icon className="size-4 text-primary" />
                  {title}
                </h3>
                <p className="mt-2 text-muted-foreground text-sm">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 text-muted-foreground text-sm">
          <KeyRound className="size-4 text-primary" />
          OpenAPI reference included, so you can generate a client in any
          language.
        </p>
      </div>
    </section>
  );
}
