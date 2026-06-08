import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { title: "Andes — 事業" };

export default async function BusinessesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <main id="main" className="grid min-h-screen place-items-center bg-[#0A1428] text-white">
      <p className="font-jp text-[14px] text-white/50">準備中 · 事業</p>
    </main>
  );
}
