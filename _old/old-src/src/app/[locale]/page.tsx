import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { FooterCta } from "@/components/home/FooterCta";
import { GroupStructure } from "@/components/home/GroupStructure";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Numbers } from "@/components/home/Numbers";
import { Portfolio } from "@/components/home/Portfolio";
import { Seller } from "@/components/home/Seller";
import { Trust } from "@/components/home/Trust";
import { WhyNow } from "@/components/home/WhyNow";
import { isLocale } from "@/i18n/routing";
import { getPageMetadata } from "@/lib/page-metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata(locale, "home.meta");
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <main id="main">
      <Hero locale={locale} />
      <Numbers locale={locale} />
      <WhyNow locale={locale} />
      <HowItWorks locale={locale} />
      <Seller locale={locale} />
      <Portfolio locale={locale} />
      <Trust locale={locale} />
      <GroupStructure locale={locale} />
      <FooterCta locale={locale} />
    </main>
  );
}
