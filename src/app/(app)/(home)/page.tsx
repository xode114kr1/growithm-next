import { auth } from "@/lib/auth/auth";
import FeatureSection from "./_components/feature-section";
import GrowthCtaSection from "./_components/growth-cta-section";
import HeroSection from "./_components/hero-section";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <main className="bg-surface text-on-surface">
      <HeroSection isAuthenticated={isAuthenticated} />
      <FeatureSection />
      <GrowthCtaSection isAuthenticated={isAuthenticated} />
    </main>
  );
}
