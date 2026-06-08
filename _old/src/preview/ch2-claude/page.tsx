import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Chapter1Overture } from "@/components/chapters/Chapter1Overture";
import { Chapter2WhyNowClaude } from "@/components/chapters/Chapter2WhyNowClaude";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  description: "Internal preview route — Chapter 2 (Why now) Claude version.",
  robots: { follow: false, index: false },
  title: "Chapter 2 (Claude preview) — Andes",
};

export default async function Ch2ClaudePreviewPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  setRequestLocale(locale);
  const hero = await getTranslations({ locale, namespace: "home.hero" });
  const whyNow = await getTranslations({ locale, namespace: "home.cinematic.whyNow" });

  return (
    <main id="main">
      <Chapter1Overture
        copy={{
          ctaPrimary: hero("cta_primary"),
          ctaSecondary: hero("cta_secondary"),
          line1: hero("line1"),
          line2: hero("line2"),
          line3: hero("line3"),
        }}
        locale={locale}
      />
      <Chapter2WhyNowClaude
        copy={{
          eyebrow: whyNow("title"),
          points: [whyNow("points.one"), whyNow("points.two"), whyNow("points.three")],
          subtitle: whyNow("subtitle"),
        }}
      />
    </main>
  );
}
