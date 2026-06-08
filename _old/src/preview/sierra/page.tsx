import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { SierraAgentOS } from "@/components/sierra/SierraAgentOS";
import { SierraCompliance } from "@/components/sierra/SierraCompliance";
import { SierraCTA } from "@/components/sierra/SierraCTA";
import { SierraFeatureStage } from "@/components/sierra/SierraFeatureStage";
import { SierraFooter } from "@/components/sierra/SierraFooter";
import { SierraHero } from "@/components/sierra/SierraHero";
import { SierraLogoWall } from "@/components/sierra/SierraLogoWall";
import { SierraNav } from "@/components/sierra/SierraNav";
import { SierraTestimonials } from "@/components/sierra/SierraTestimonials";
import { isLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  description: "Internal study — faithful reproduction of sierra.ai structure + animations (placeholder content).",
  robots: { follow: false, index: false },
  title: "Sierra (study reproduction)",
};

export default async function SierraStudyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <div className="w-full bg-white text-[#302E2D]">
      <SierraNav />
      <main>
        <SierraHero />
        <SierraLogoWall />
        <SierraFeatureStage />
        <SierraTestimonials />
        <SierraAgentOS />
        <SierraCompliance />
        <SierraCTA />
      </main>
      <SierraFooter />
    </div>
  );
}
