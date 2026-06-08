"use client";

import Link from "next/link";

import type { Locale } from "@/i18n/routing";

type Column = {
  heading: string;
  links: { href: string; label: string }[];
};

type Props = {
  locale: Locale;
  columns: Column[];
  copyright: string;
  legal: { href: string; label: string }[];
  location: string;
};

export function FooterV2({ columns, copyright, legal, locale, location }: Props) {
  return (
    <footer className="relative w-full bg-[#080F1C] text-white/80">
      <div className="mx-auto w-full max-w-[1425px] px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link
              className="inline-flex items-center gap-3 font-display text-[17px] font-semibold text-white"
              href={`/${locale}`}
            >
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-sm bg-white text-[12px] font-bold text-[#0A1428]"
              >
                A
              </span>
              Andes Inc.
            </Link>
            <p className="mt-6 font-jp text-[13px] leading-[1.65] text-white/55">
              Agentic Commerce for LATAM.
              <br />
              {location}
            </p>
          </div>

          <div className="grid w-full max-w-3xl grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-14">
            {columns.map((column) => (
              <div className="flex flex-col gap-4" key={column.heading}>
                <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                  {column.heading}
                </span>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="font-jp text-[13px] text-white/75 transition hover:text-white"
                        href={`/${locale}${link.href}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-[11px] tracking-[0.12em] text-white/40">{copyright}</span>
          <ul className="flex flex-wrap items-center gap-6">
            {legal.map((link) => (
              <li key={link.href}>
                <Link
                  className="font-display text-[11px] tracking-[0.12em] text-white/50 transition hover:text-white"
                  href={`/${locale}${link.href}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
