"use client";

import Link from "next/link";

import type { Locale } from "@/i18n/routing";

export type Chapter7Copy = {
  contactDesc: string;
  contactTitle: string;
  cta: string;
  groupDesc: string;
  groupTitle: string;
  nodes: [string, string, string, string];
  windows: [string, string, string, string];
};

export function Chapter7GroupCta({ copy, locale }: { copy: Chapter7Copy; locale: Locale }) {
  return (
    <section
      aria-label={copy.contactTitle}
      className="relative min-h-[150vh] overflow-clip bg-andes-paper text-andes-ink"
      data-cinematic-from="var(--color-andes-black)"
      data-cinematic-to="var(--color-andes-paper)"
    >
      <div className="sticky top-0 z-10 grid min-h-screen items-center px-5 py-24 sm:px-8 lg:px-16">
        <div className="mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,0.85fr)] lg:items-end">
          <div>
            <p className="text-sm text-gray-500">{copy.groupDesc}</p>
            <h2 className="mt-5 max-w-[11ch] font-display text-[clamp(3.2rem,8vw,7.6rem)] font-bold leading-[0.86] tracking-[-0.055em]">
              {copy.groupTitle}
            </h2>
            <ol className="mt-10 grid gap-3">
              {copy.nodes.map((node, index) => (
                <li className="grid grid-cols-[2.5rem_1fr] items-center gap-4" key={node}>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-andes-ink/20 text-sm text-gray-500">
                    {index + 1}
                  </span>
                  <span className="border-b border-andes-ink/12 py-3 font-display text-2xl font-semibold tracking-[-0.035em]">
                    {node}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-md border border-andes-ink/10 bg-andes-paper p-6 shadow-[0_30px_80px_rgba(15,27,61,0.08)] sm:p-8">
            <h3 className="font-display text-[clamp(2.25rem,5vw,5rem)] font-bold leading-[0.9] tracking-[-0.055em]">
              {copy.contactTitle}
            </h3>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-700">{copy.contactDesc}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.windows.map((windowLabel) => (
                <p className="rounded-md border border-andes-ink/10 px-4 py-3 text-sm text-gray-700" key={windowLabel}>
                  {windowLabel}
                </p>
              ))}
            </div>
            <Link
              className="mt-8 inline-flex min-h-12 items-center rounded-full bg-andes-navy px-7 text-sm font-semibold text-andes-paper transition duration-300 ease-andes hover:bg-andes-navy/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson active:scale-[0.97]"
              href={`/${locale}/contact`}
            >
              {copy.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
