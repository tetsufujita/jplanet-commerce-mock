"use client";

import Image from "next/image";
import Link from "next/link";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionHeading } from "@/components/v2/SectionHeading";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import type { Locale } from "@/i18n/routing";

export type CareerOpening = {
  role: string;
  count: string;
  body: string;
  href: string;
  cta: string;
};

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
  body?: string;
  openings: CareerOpening[];
  contactCta: { href: string; label: string };
  /** Optional accent image rendered as a wide band below the heading. */
  accentImage?: { src: string; alt: string };
};

export function CareersV2({
  accentImage,
  body,
  contactCta,
  eyebrow,
  locale,
  openings,
  title,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [contactRef, contactVisible] = useReveal<HTMLDivElement>();

  return (
    <SectionWrapper id="careers" label={title}>
      <SectionHeading body={body} eyebrow={eyebrow} title={title} />

      {accentImage ? (
        <div className="relative mt-14 aspect-[21/9] w-full overflow-hidden rounded-[28px] lg:mt-20">
          <Image
            alt={accentImage.alt}
            className="object-cover"
            fill
            sizes="100vw"
            src={accentImage.src}
            unoptimized
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,20,40,0.15) 0%, rgba(10,20,40,0) 35%, rgba(10,20,40,0) 65%, rgba(10,20,40,0.65) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10"
          />
        </div>
      ) : null}

      <ul className="mt-14 flex flex-col divide-y divide-white/10 lg:mt-20">
        {openings.map((opening, index) => (
          <Opening
            href={`/${locale}${opening.href}`}
            index={index}
            key={opening.role}
            opening={opening}
            reducedMotion={reducedMotion}
          />
        ))}
      </ul>

      <div
        className="mt-14 flex flex-wrap items-center gap-6 lg:mt-20"
        ref={contactRef}
        style={fadeUpStyle(contactVisible, 0.1, reducedMotion)}
      >
        <Link
          className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0A1428] transition hover:bg-white/90 active:scale-[0.97]"
          href={`/${locale}${contactCta.href}`}
        >
          {contactCta.label}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </SectionWrapper>
  );
}

function Opening({
  href,
  index,
  opening,
  reducedMotion,
}: {
  href: string;
  index: number;
  opening: CareerOpening;
  reducedMotion: boolean;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>();

  return (
    <li
      className="group"
      ref={ref}
      style={fadeUpStyle(visible, 0.06 * index, reducedMotion)}
    >
      <Link
        className="flex flex-col gap-4 py-8 transition-colors duration-300 hover:bg-white/[0.025] sm:py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:px-2"
        href={href}
      >
        <div className="flex flex-col gap-2 lg:flex-1">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
            {opening.count}
          </span>
          <h3 className="font-jp text-[clamp(1.4rem,2.2vw,1.95rem)] font-medium leading-[1.2] tracking-[-0.015em] text-white">
            {opening.role}
          </h3>
        </div>
        <p className="max-w-[44ch] font-jp text-[14px] leading-[1.7] text-white/65 sm:text-[15px] lg:flex-1">
          {opening.body}
        </p>
        <span className="inline-flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 transition group-hover:text-white">
          {opening.cta}
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </span>
      </Link>
    </li>
  );
}
