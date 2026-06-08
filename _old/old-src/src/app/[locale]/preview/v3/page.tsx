import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Numbers } from "@/components/home/Numbers";
import { HeroV3 } from "@/components/v2/HeroV3";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Andes v3 preview",
};

export default async function V3PreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <main id="main">
      <HeroV3 locale={locale} />
      <Numbers locale={locale} />
    </main>
  );
}
