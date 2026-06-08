import { defineRouting } from "next-intl/routing";

export const locales = ["ja", "en", "pt-BR"] as const;
export const defaultLocale = "ja" as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}
