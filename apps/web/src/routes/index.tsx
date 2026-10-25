import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import { Architecture } from "@/components/landing/architecture";
import { Audiences } from "@/components/landing/audiences";
import { Billing } from "@/components/landing/billing";
import { CallToAction } from "@/components/landing/call-to-action";
import { Clients } from "@/components/landing/clients";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Principles } from "@/components/landing/principles";
import { Roadmap } from "@/components/landing/roadmap";
import { ScaleToZero } from "@/components/landing/scale-to-zero";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Billing />
        <ScaleToZero />
        <Architecture />
        <Clients />
        <Audiences />
        <Principles />
        <Roadmap />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </MotionConfig>
  );
}
