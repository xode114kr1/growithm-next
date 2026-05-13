import FeatureSection from "@/features/home/components/feature-section";
import GrowthCtaSection from "@/features/home/components/growth-cta-section";
import HeroSection from "@/features/home/components/hero-section";

export default function Home() {
  return (
    <main className="bg-surface text-on-surface">
      <HeroSection />
      <FeatureSection />
      <GrowthCtaSection />
    </main>
  );
}
