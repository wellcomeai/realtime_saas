import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { WhatIsItSection } from "@/components/landing/WhatIsIt";
import { BentoFeaturesSection } from "@/components/landing/Features";
import { AIAgentsSection } from "@/components/landing/AIAgents";
import { ReferralSection } from "@/components/landing/ReferralSection";
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
        <WhatIsItSection />
        <BentoFeaturesSection />
        <AIAgentsSection />
        <ReferralSection />
        <HowToStartSection />
        <ManifestoSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
