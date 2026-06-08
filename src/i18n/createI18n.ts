import i18next, { type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/locales/en.json";
import ja from "@/i18n/locales/ja.json";
import ptBr from "@/i18n/locales/pt-BR.json";

export const supportedLocales = ["ja", "en", "pt-BR"] as const;
export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "ja";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && supportedLocales.some((locale) => locale === value);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/").find((part) => part.length > 0);
  return isLocale(segment) ? segment : null;
}

const resources = {
  ja: {
    translation: ja,
  },
  en: {
    translation: en,
  },
  "pt-BR": {
    translation: ptBr,
  },
} satisfies Record<Locale, { translation: typeof ja }>;

export async function createI18n(locale: unknown = defaultLocale): Promise<i18n> {
  const instance = i18next.createInstance();
  const selectedLocale = isLocale(locale) ? locale : defaultLocale;

  await instance.use(initReactI18next).init({
    resources,
    lng: selectedLocale,
    fallbackLng: defaultLocale,
    supportedLngs: supportedLocales,
    interpolation: {
      escapeValue: false,
    },
  });

  return instance;
}
