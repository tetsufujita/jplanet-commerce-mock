"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import { locales, type Locale } from "@/i18n/routing";
import { getLocalizedPathname } from "@/lib/i18n-path";

const localeLabels: Record<Locale, string> = {
  ja: "JA",
  en: "EN",
  "pt-BR": "PT",
};

export function LangSwitcher({ isDark = false }: { isDark?: boolean }) {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{t("lang_switcher_label")}</span>
      <select
        aria-label={t("lang_switcher_label")}
        className={[
          "h-10 rounded-lg border bg-transparent px-3 text-xs font-semibold uppercase outline-none transition duration-300 ease-andes focus-visible:outline-2 focus-visible:outline-offset-2",
          isDark
            ? "border-andes-paper/25 text-andes-paper focus-visible:outline-andes-paper"
            : "border-andes-navy/20 text-andes-navy focus-visible:outline-andes-crimson",
        ].join(" ")}
        onChange={(event) => {
          router.push(getLocalizedPathname(pathname, event.target.value as Locale));
        }}
        value={currentLocale}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeLabels[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
