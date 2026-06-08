"use client";

import Link from "next/link";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionHeading } from "@/components/v2/SectionHeading";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import type { Locale } from "@/i18n/routing";

export type SolutionItem = {
  tag: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Accent color hex used on the eyebrow + hover stroke. */
  accent: string;
};

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
  body?: string;
  items: SolutionItem[];
};

export function SolutionsV2({ body, eyebrow, items, locale, title }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <SectionWrapper id="solutions" label="Solutions">
      <SectionHeading body={body} eyebrow={eyebrow} title={title} />

      <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-3 lg:gap-6">
        {items.map((item, index) => (
          <SolutionCard
            href={`/${locale}${item.href}`}
            index={index}
            item={item}
            key={item.title}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function SolutionCard({
  href,
  index,
  item,
  reducedMotion,
}: {
  href: string;
  index: number;
  item: SolutionItem;
  reducedMotion: boolean;
}) {
  const [ref, visible] = useReveal<HTMLAnchorElement>();

  return (
    <Link
      className="group relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-md transition duration-500 ease-andes hover:border-white/35 hover:bg-white/[0.07] sm:p-9"
      href={href}
      ref={ref}
      style={fadeUpStyle(visible, index * 0.08, reducedMotion)}
    >
      {/* Accent edge on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r transition-transform duration-700 ease-andes group-hover:scale-x-100"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${item.accent} 50%, transparent 100%)`,
        }}
      />

      <div className="flex flex-col gap-5">
        <span
          className="font-display text-[10px] font-medium uppercase tracking-[0.24em]"
          style={{ color: item.accent }}
        >
          {item.tag}
        </span>
        <h3 className="font-jp text-[clamp(1.4rem,2.2vw,1.95rem)] font-medium leading-[1.2] tracking-[-0.015em] text-white">
          {item.title}
        </h3>
        <p className="font-jp text-[14px] leading-[1.65] text-white/68 sm:text-[15px]">{item.body}</p>
      </div>

      <span className="inline-flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 transition-colors duration-300 group-hover:text-white">
        {item.cta}
        <span
          aria-hidden
          className="inline-block transition-transform duration-500 ease-andes group-hover:translate-x-1.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
