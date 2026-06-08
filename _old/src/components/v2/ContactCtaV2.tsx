"use client";

import Image from "next/image";
import Link from "next/link";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SplitChar } from "@/components/v2/SplitChar";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
  body: string;
  ctaPrimary: { href: string; label: string };
  ctaSecondary?: { href: string; label: string };
  /** Optional backdrop image displayed behind the CTA copy. */
  backdropImage?: { src: string; alt: string };
};

export function ContactCtaV2({
  backdropImage,
  body,
  ctaPrimary,
  ctaSecondary,
  eyebrow,
  locale,
  title,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [eyebrowRef, eyebrowVisible] = useReveal<HTMLSpanElement>();
  const [bodyRef, bodyVisible] = useReveal<HTMLParagraphElement>();
  const [ctaRef, ctaVisible] = useReveal<HTMLDivElement>();

  return (
    <SectionWrapper id="contact" label={title} rhythm="large">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1730]/40 px-8 py-14 backdrop-blur-md sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        {backdropImage ? (
          <>
            <Image
              alt={backdropImage.alt}
              aria-hidden
              className="pointer-events-none object-cover opacity-55"
              fill
              sizes="100vw"
              src={backdropImage.src}
              unoptimized
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.55) 55%, rgba(10,20,40,0.85) 100%)",
              }}
            />
          </>
        ) : null}

        <div className="relative flex flex-col items-start gap-8 lg:gap-12">
        <span
          className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-[#F0E8C0] sm:text-[13px] sm:tracking-[0.2em]"
          ref={eyebrowRef}
          style={fadeUpStyle(eyebrowVisible, 0, reducedMotion)}
        >
          {eyebrow}
        </span>
        <h2 className="max-w-[16ch] font-jp text-[clamp(2.6rem,6vw,5.2rem)] font-bold leading-[1] tracking-[-0.04em] text-white">
          <SplitChar delay={0.1} text={title} />
        </h2>
        <p
          className="max-w-[44ch] font-jp text-[clamp(0.95rem,1.3vw,1.2rem)] font-light leading-[1.7] text-white/75"
          ref={bodyRef}
          style={fadeUpStyle(bodyVisible, 0.3, reducedMotion)}
        >
          {body}
        </p>
        <div
          className="flex flex-wrap items-center gap-6 pt-2"
          ref={ctaRef}
          style={fadeUpStyle(ctaVisible, 0.45, reducedMotion)}
        >
          <Link
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-8 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0A1428] transition duration-300 ease-andes hover:bg-white/90 active:scale-[0.97]"
            href={`/${locale}${ctaPrimary.href}`}
          >
            {ctaPrimary.label}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          {ctaSecondary ? (
            <Link
              className="group inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
              href={`/${locale}${ctaSecondary.href}`}
            >
              {ctaSecondary.label}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ) : null}
        </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
