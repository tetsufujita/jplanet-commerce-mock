import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { isLocale } from "@/i18n/routing";

type MetadataNamespace =
  | "home.meta"
  | "about.meta"
  | "businesses.meta"
  | "careers.meta"
  | "press.meta"
  | "contact.meta";

export async function getPageMetadata(
  locale: string,
  namespace: MetadataNamespace,
): Promise<Metadata> {
  if (!isLocale(locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace });

  return {
    title: t("title"),
    description: t("description"),
  };
}
