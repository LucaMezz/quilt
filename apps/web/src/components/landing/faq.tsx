import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@quilt/ui/components/accordion";
import { BlurFade } from "@quilt/ui/components/blur-fade";
import { SectionHeading } from "./section-heading";

const questions = [
  {
    question: "Who is quilt for?",
    answer:
      "Mainly businesses that want their own PaaS on servers they control, either as an internal platform for their teams or as hosting they sell to customers. It works just as well for a single team or a solo developer with a few spare servers.",
  },
  {
    question: "How does billing work?",
    answer:
      "Usage is measured by the CPU and memory an app reserves while it is running. A sleeping app reserves nothing, so it isn't billed. You set the rates and quotas per organization. Usage-based billing is on the roadmap.",
  },
  {
    question: "Can we keep departments or customers apart?",
    answer:
      "Yes. Each organization has its own apps, members, roles and API keys, and every API request names the organization it acts on.",
  },
  {
    question: "Do I have to use scale to zero?",
    answer:
      "No. It is a per-app setting. Turn it off for high-traffic apps or apps that don't suit sleeping, and quilt keeps a minimum number of instances running at all times. Always-on apps are billed for every hour they run.",
  },
  {
    question: "Can I try it without installing anything?",
    answer:
      "Yes. On the live demo you can sign in, create an organization and deploy an app. If you host quilt yourself, this page is the default home page and you can replace it with your own.",
  },
  {
    question: "Is quilt ready for production?",
    answer:
      "Not yet. quilt is an alpha, and the prototype covers stateless apps only. Use it for internal tools, staging and previews while it matures.",
  },
  {
    question: "Does anyone need to know Kubernetes?",
    answer:
      "No. quilt runs k3s and Knative for you, and your teams never see a manifest or kubectl. They work with organizations, apps and servers.",
  },
  {
    question: "What servers can we use?",
    answer:
      "Any Linux server, x86 or ARM, from any provider or your own data center. Mix machines from different hosts and group them with zone labels.",
  },
  {
    question: "Can we run databases on it?",
    answer:
      "Not in the prototype. Postgres with high availability and S3 backups is planned for v1, and every volume will carry a durability label saying what it survives.",
  },
  {
    question: "How is this different from Coolify or Dokploy?",
    answer:
      "They keep every app running all the time and leave you to choose where it runs. quilt places apps across all your servers, puts idle ones to sleep, and is built around organizations and usage metering, so you can run it as a platform for other people.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4 py-24">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" centered />

        <BlurFade inView direction="up">
          <Accordion className="mt-12 rounded-xl bg-card">
            {questions.map(({ question, answer }) => (
              <AccordionItem key={question}>
                <AccordionTrigger className="px-5 py-4 text-sm">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="px-3 text-muted-foreground text-sm">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  );
}
