import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { HeroV4 } from "@/components/v4/HeroV4";
import { ServicesV4 } from "@/components/v4/ServicesV4";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  description: "Internal preview — v4 build (Stripe/Sierra-style infra hero with chat).",
  robots: { follow: false, index: false },
  title: "Andes v4 (preview)",
};

export default async function V4PreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen w-full bg-[#0A1428] text-white">
      <main id="main">
        <HeroV4 locale={locale} />
        <ServicesV4 />
      </main>
    </div>
  );
}
