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

const durability = [
  {
    data: "Stateless apps",
    promise: "Rescheduled when a node fails",
    phase: "Prototype",
  },
  {
    data: "Postgres",
    promise: "Survives one node loss, backed up to S3",
    phase: "v1",
  },
  {
    data: "SQLite apps",
    promise: "Restored from backup, small loss window",
    phase: "Planned",
  },
  {
    data: "General volumes",
    promise: "3 replicas, survives one node loss",
    phase: "v2",
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
          {principles.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <Icon className="size-5 text-primary" />
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="border-b p-4 text-left font-medium">
              Durability labels, by data type
            </caption>
            <thead className="text-muted-foreground text-xs">
              <tr className="border-b">
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">What it survives</th>
                <th className="p-4 font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {durability.map(({ data, promise, phase }) => (
                <tr key={data} className="border-b last:border-0">
                  <td className="p-4 font-medium">{data}</td>
                  <td className="p-4 text-muted-foreground">{promise}</td>
                  <td className="p-4">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {phase}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
