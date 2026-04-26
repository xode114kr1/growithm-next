import FeatureSection from "@/app/(app)/(home)/_components/feature-section";
import GrowthCtaSection from "@/app/(app)/(home)/_components/growth-cta-section";
import HeroSection from "@/app/(app)/(home)/_components/hero-section";

export default function Home() {
  return (
    <main className="bg-surface text-on-surface">
      <HeroSection />
      <FeatureSection />
      <GrowthCtaSection />
    </main>
  );
}
