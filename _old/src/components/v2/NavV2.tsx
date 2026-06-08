"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LangSwitcher } from "@/components/ui/LangSwitcher";
import type { Locale } from "@/i18n/routing";
import { cx } from "@/lib/classnames";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  locale: Locale;
  items: NavItem[];
  ctaLabel: string;
  ctaHref: string;
  brand: string;
};

export function NavV2({ brand, ctaHref, ctaLabel, items, locale }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-andes",
        scrolled
          ? "bg-[#0A1428]/85 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[64px] w-full max-w-[1425px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link
          className="inline-flex items-center gap-3 font-display text-[15px] font-semibold tracking-[-0.005em] text-white"
          href={`/${locale}`}
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-sm bg-white text-[11px] font-bold text-[#0A1428]"
          >
            A
          </span>
          {brand}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <Link
              className="font-display text-[13px] font-medium tracking-[0.04em] text-white/75 transition hover:text-white"
              href={`/${locale}${item.href}`}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LangSwitcher isDark />
          <Link
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-5 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0A1428] transition hover:bg-white/90 active:scale-[0.97]"
            href={`/${locale}${ctaHref}`}
          >
            {ctaLabel}
          </Link>
        </div>

        {/* Mobile: just CTA */}
        <Link
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A1428] md:hidden"
          href={`/${locale}${ctaHref}`}
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Hairline divider under the nav */}
      <div
        aria-hidden
        className={cx(
          "h-px w-full transition-opacity duration-300",
          scrolled ? "bg-white/10 opacity-100" : "opacity-0",
        )}
      />

      <span className="sr-only">{pathname}</span>
    </header>
  );
}
