import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { title: "Andes — お問い合わせ" };

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  return (
    <main id="main" className="grid min-h-screen place-items-center bg-[#0A1428] text-white">
      <p className="font-jp text-[14px] text-white/50">準備中 · お問い合わせ</p>
    </main>
  );
}
