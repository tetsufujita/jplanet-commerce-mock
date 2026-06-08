import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { title: "Andes — プレス" };

export default async function PressPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <main id="main" className="grid min-h-screen place-items-center bg-[#0A1428] text-white">
      <p className="font-jp text-[14px] text-white/50">準備中 · プレス</p>
    </main>
  );
}
