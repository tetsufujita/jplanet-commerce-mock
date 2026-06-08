import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { HomeHero } from "@/components/sections/HomeHero";
import { ProductSection } from "@/components/sections/ProductSection";

export function HomePage() {
  return (
    <main className="relative overflow-hidden bg-bg text-text">
      <div
        aria-hidden="true"
        data-background="continuous-hero"
        className="homepage-continuous-bg pointer-events-none absolute inset-x-0 top-0 z-0 h-[2400px] max-h-[260svh] min-h-[1900px] bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.webp')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[2400px] max-h-[260svh] min-h-[1900px] bg-gradient-to-b from-bg/10 via-bg/24 to-bg"
      />
      <div className="relative z-10">
        <HomeHero />
        <ProductSection />
        <HowItWorksSection />
      </div>
    </main>
  );
}
