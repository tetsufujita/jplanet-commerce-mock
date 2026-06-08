"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { LangSwitcher } from "@/components/ui/LangSwitcher";
import type { Locale } from "@/i18n/routing";
import { cx } from "@/lib/classnames";

type FooterKey =
  | "businesses_jplanet"
  | "businesses_jvita"
  | "company_about"
  | "company_careers"
  | "company_press"
  | "company_contact"
  | "legal_privacy"
  | "legal_terms"
  | "legal_cookies";

const businessLinks: readonly FooterItem[] = [
  { key: "businesses_jplanet", href: "/businesses" },
  { key: "businesses_jvita", href: "/businesses" },
] as const;

const companyLinks: readonly FooterItem[] = [
  { key: "company_about", href: "/about" },
  { key: "company_careers", href: "/careers" },
  { key: "company_press", href: "/press" },
  { key: "company_contact", href: "/contact" },
] as const;

const legalLinks: readonly FooterItem[] = [
  { key: "legal_privacy", href: "/privacy" },
  { key: "legal_terms", href: "/terms" },
  { key: "legal_cookies", href: "/cookies" },
] as const;

export function Footer() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("footer");
  const common = useTranslations("common");
  const isDark = pathname.includes("/businesses") || pathname.includes("/careers");

  // Preview routes ship their own footer (FooterV2 etc.) — suppress global footer here.
  if (pathname.includes("/preview/")) return null;

  return (
    <footer
      className={cx(
        "border-t",
        isDark
          ? "border-andes-paper/10 bg-andes-navy text-andes-paper"
          : "border-gray-100 bg-andes-paper text-andes-ink",
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Link
            className="inline-flex items-center gap-3 rounded-lg font-display text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson"
            href={`/${locale}`}
          >
            <span
              aria-hidden
              className={cx(
                "grid h-8 w-8 place-items-center rounded-sm text-xs font-bold",
                isDark ? "bg-andes-paper text-andes-navy" : "bg-andes-navy text-andes-paper",
              )}
            >
              A
            </span>
            <span>{common("company")}</span>
          </Link>
          <p className={cx("mt-5 max-w-sm text-sm", isDark ? "text-andes-paper/70" : "text-gray-500")}>
            {t("group_companies")}
          </p>
          <p className={cx("mt-3 text-sm", isDark ? "text-andes-paper/55" : "text-gray-500")}>
            {common("tagline")}
          </p>
          <div className="mt-8">
            <LangSwitcher isDark={isDark} />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <FooterColumn
            isDark={isDark}
            items={businessLinks}
            label={t("businesses_label")}
            locale={locale}
            t={t}
          />
          <FooterColumn
            isDark={isDark}
            items={companyLinks}
            label={t("company_label")}
            locale={locale}
            t={t}
          />
          <FooterColumn
            isDark={isDark}
            items={legalLinks}
            label={t("legal_label")}
            locale={locale}
            t={t}
          />
        </div>
      </div>

      <div
        className={cx(
          "border-t px-5 py-6 text-sm sm:px-8",
          isDark ? "border-andes-paper/10 text-andes-paper/55" : "border-gray-100 text-gray-500",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("copyright")}</span>
          <span>{t("location")}</span>
        </div>
      </div>
    </footer>
  );
}

type FooterItem = {
  key: FooterKey;
  href: string;
};

function FooterColumn({
  isDark,
  items,
  label,
  locale,
  t,
}: {
  isDark: boolean;
  items: readonly FooterItem[];
  label: string;
  locale: Locale;
  t: (key: FooterKey) => string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{label}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              className={cx(
                "rounded-md text-sm transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson",
                isDark ? "text-andes-paper/70" : "text-gray-500",
              )}
              href={`/${locale}${item.href}`}
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
