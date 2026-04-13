"use client";

import LandingNav from "./landing-nav";
import HeroSection from "./hero-section";
import HowItWorksSection from "./how-it-works-section";
import ShowcaseSection from "./showcase-section";
import FeaturesSection from "./features-section";
import PricingSection from "./pricing-section";
import CtaSection from "./cta-section";
import LandingFooter from "./landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
