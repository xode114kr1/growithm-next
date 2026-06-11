import FeatureSection from "./_components/feature-section";
import GrowthCtaSection from "./_components/growth-cta-section";
import HeroSection from "./_components/hero-section";

export default function Home() {
  return (
    <main className="bg-surface text-on-surface">
      <HeroSection />
      <FeatureSection />
      <GrowthCtaSection />
    </main>
  );
}
