import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { WhatInside } from "@/components/landing/WhatInside";
import { AuthSection } from "@/components/landing/AuthSection";
import { PaymentsSection } from "@/components/landing/PaymentsSection";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { AIAgentsSection } from "@/components/landing/AIAgents";
import { HowToStartSection } from "@/components/landing/HowToStart";
import { ManifestoSection } from "@/components/landing/Manifesto";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <Hero />
        <LogoStrip />
        <WhatInside />
        <AuthSection />
        <PaymentsSection />
        <ReferralSection />
        <AIAgentsSection />
        <HowToStartSection />
        <ManifestoSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
