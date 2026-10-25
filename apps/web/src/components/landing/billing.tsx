import { Badge } from "@quilt/ui/components/badge";
import { BlurFade } from "@quilt/ui/components/blur-fade";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@quilt/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";
import { Gauge, Receipt, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const cpuRate = 0.02;
const memoryRate = 0.01;

const usage = [
  { app: "web", cpu: 1, memory: 1, hours: 744 },
  { app: "api", cpu: 0.5, memory: 0.5, hours: 310 },
  { app: "staging", cpu: 0.5, memory: 0.5, hours: 62 },
  { app: "pr-142", cpu: 0.25, memory: 0.25, hours: 4 },
].map((row) => ({
  ...row,
  cost: row.hours * (row.cpu * cpuRate + row.memory * memoryRate),
}));

const total = usage.reduce((sum, { cost }) => sum + cost, 0);

const points = [
  {
    icon: Gauge,
    title: "Priced on reservations",
    body: "Billing follows the CPU and memory an app reserves, so the cost of an app is known before it is deployed.",
  },
  {
    icon: Receipt,
    title: "Your rates, your invoices",
    body: "Set a price per vCPU-hour and GiB-hour to bill customers, or use the same numbers for internal chargeback.",
  },
  {
    icon: ShieldCheck,
    title: "Quotas per organization",
    body: "Cap what each organization can reserve, so one team or customer can't fill the cluster.",
  },
];

function formatMemory(gib: number) {
  return gib < 1 ? `${gib * 1024} MiB` : `${gib} GiB`;
}

export function Billing() {
  return (
    <section id="billing" className="scroll-mt-16 border-t">
      <div className="container mx-auto grid max-w-6xl gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Usage-based billing"
            title="Bill for what runs, not for what sits idle"
            description="quilt meters the CPU and memory each app reserves while it is running. A sleeping app reserves nothing, so it costs nothing, and every organization gets a bill that matches what it used."
          />

          <BlurFade inView direction="up">
            <ul className="mt-8 space-y-6">
              {points.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="mt-1 text-muted-foreground text-sm">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </BlurFade>
        </div>

        <BlurFade inView direction="up">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>acme-marketing</CardTitle>
              <CardDescription>October usage</CardDescription>
              <CardAction>
                <Badge variant="outline">On the roadmap</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead className="text-right">Hours running</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map(({ app, cpu, memory, hours, cost }) => (
                    <TableRow key={app}>
                      <TableCell className="font-mono">{app}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {cpu} vCPU · {formatMemory(memory)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {hours}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        ${cost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
            <CardFooter className="border-t text-muted-foreground">
              <p>
                Illustration at ${cpuRate} per vCPU-hour and ${memoryRate} per
                GiB-hour. web is always on and billed for every hour, while
                staging slept for 682 of 744 hours and was billed for 62.
              </p>
            </CardFooter>
          </Card>
        </BlurFade>
      </div>
    </section>
  );
}
