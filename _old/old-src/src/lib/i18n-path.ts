import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];

  return isLocale(segment) ? segment : defaultLocale;
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const rest = isLocale(segments[0]) ? segments.slice(1) : segments;

  return rest.length === 0 ? "/" : `/${rest.join("/")}`;
}

export function getLocalizedPathname(pathname: string, locale: Locale): string {
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  return pathWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathWithoutLocale}`;
}
