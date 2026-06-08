"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { buttonClassName } from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";
import { cx } from "@/lib/classnames";
import { getLocalizedPathname } from "@/lib/i18n-path";

const navItems = [
  { key: "businesses", path: "/businesses" },
  { key: "about", path: "/about" },
  { key: "careers", path: "/careers" },
  { key: "press", path: "/press" },
] as const;

export function Header() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHomePage = pathname === `/${locale}`;

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>("[data-header-theme-end]");
      const homeThreshold = hero
        ? Math.max(64, hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.75)
        : Math.max(64, window.innerHeight - 120);
      setScrolled(window.scrollY > (isHomePage ? homeThreshold : 64));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Preview routes ship their own nav (NavV2 etc.) — suppress global header here.
  if (pathname.includes("/preview/")) return null;

  const isDarkPage = pathname.includes("/businesses") || pathname.includes("/careers");
  const isDark = isDarkPage;
  const contactHref = getLocalizedPathname(`/${locale}/contact`, locale);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 border-b transition duration-300 ease-andes",
        isHomePage
          ? scrolled
            ? "border-gray-100 bg-andes-light-paper/95 text-andes-light-ink shadow-[0_8px_24px_rgba(15,27,61,0.06)] backdrop-blur"
            : "border-transparent bg-transparent text-andes-light-ink"
          : isDarkPage
            ? "border-andes-paper/10 bg-andes-navy text-andes-paper"
            : scrolled
              ? "border-gray-100 bg-andes-paper/95 text-andes-ink shadow-[0_8px_24px_rgba(15,27,61,0.06)] backdrop-blur"
              : "border-transparent bg-transparent text-andes-ink",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:h-[72px] sm:px-8">
        <Link
          className="inline-flex items-center gap-3 rounded-lg font-display text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson"
          href={`/${locale}`}
        >
          <span
            aria-hidden
            className={cx(
              "grid h-7 w-7 place-items-center rounded-sm text-xs font-bold",
              isDark ? "bg-andes-paper text-andes-navy" : "bg-andes-navy text-andes-paper",
            )}
          >
            A
          </span>
          <span>{common("company")}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              className="rounded-md text-sm font-medium transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson"
              href={`/${locale}${item.path}`}
              key={item.key}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LangSwitcher isDark={isDark} />
          <Link
            className={buttonClassName(isDark ? "paper" : "primary", "min-h-10 px-4")}
            href={contactHref}
          >
            {t("contact")}
          </Link>
        </div>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t("menu_close") : t("menu_open")}
          className={cx(
            "inline-grid h-10 w-10 place-items-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden",
            isDark
              ? "border-andes-paper/25 focus-visible:outline-andes-paper"
              : "border-andes-navy/20 focus-visible:outline-andes-crimson",
          )}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span className="sr-only">{menuOpen ? t("menu_close") : t("menu_open")}</span>
          <span aria-hidden className="flex flex-col gap-1.5">
            <span className={cx("h-px w-5", isDark ? "bg-andes-paper" : "bg-andes-navy")} />
            <span className={cx("h-px w-5", isDark ? "bg-andes-paper" : "bg-andes-navy")} />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <div
          className={cx(
            "min-h-[calc(100vh-4rem)] border-t px-5 py-8 md:hidden",
            isDark
              ? "border-andes-paper/10 bg-andes-navy text-andes-paper"
              : "border-gray-100 bg-andes-paper text-andes-ink",
          )}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {navItems.map((item) => (
              <Link
                className="rounded-lg py-4 text-2xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-crimson"
                href={`/${locale}${item.path}`}
                key={item.key}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-current/10 pt-6">
            <LangSwitcher isDark={isDark} />
            <Link
              className={buttonClassName(isDark ? "paper" : "primary", "min-h-10 px-4")}
              href={contactHref}
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
