import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { HeroV5 } from "@/components/v5/HeroV5";
import { isLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  description: "Internal preview — v5 ambition / declaration direction.",
  robots: { follow: false, index: false },
  title: "Andes v5 (preview)",
};

export default async function V5PreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen w-full bg-[#0A1428] text-white">
      <main id="main">
        <HeroV5 locale={locale} />
      </main>
    </div>
  );
}
