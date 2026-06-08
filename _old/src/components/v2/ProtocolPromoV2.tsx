"use client";

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
  bullets: string[];
  cta: { href: string; label: string };
};

/**
 * Shopify "Sidekick" equivalent — full-width purple/indigo gradient panel
 * announcing the LATAM Agentic Commerce Protocol (long-game "secret weapon").
 */
export function ProtocolPromoV2({
  body,
  bullets,
  cta,
  eyebrow,
  locale,
  title,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [copyRef, copyVisible] = useReveal<HTMLDivElement>();
  const [listRef, listVisible] = useReveal<HTMLUListElement>();

  return (
    <SectionWrapper label={title} rhythm="large">
      <div
        className="relative overflow-hidden rounded-[32px] border border-white/12 px-7 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24"
        style={{
          background:
            "radial-gradient(110% 90% at 0% 0%, rgba(96,72,200,0.95) 0%, rgba(50,32,140,0.95) 50%, rgba(20,18,60,0.95) 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 50% at 90% 100%, rgba(255,160,200,0.18) 0%, rgba(20,18,60,0) 70%)," +
              "radial-gradient(40% 30% at 10% 0%, rgba(240,232,192,0.10) 0%, rgba(20,18,60,0) 70%)",
          }}
        />

        <div className="relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-20">
          <div
            className="flex flex-col gap-7"
            ref={copyRef}
            style={fadeUpStyle(copyVisible, 0, reducedMotion)}
          >
            <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-[#FFE0A0] sm:text-[13px]">
              {eyebrow}
            </span>
            <h2 className="max-w-[16ch] font-jp text-[clamp(2.4rem,5.4vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
              <SplitChar delay={0} text={title} />
            </h2>
            <p className="max-w-[44ch] font-jp text-[clamp(0.95rem,1.2vw,1.2rem)] font-light leading-[1.75] text-white/85">
              {body}
            </p>
            <Link
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#1A1450] transition hover:bg-white/90 active:scale-[0.97]"
              href={`/${locale}${cta.href}`}
            >
              {cta.label}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <ul
            className="grid gap-4"
            ref={listRef}
            style={fadeUpStyle(listVisible, 0.12, reducedMotion)}
          >
            {bullets.map((bullet, index) => (
              <li
                className="flex items-start gap-4 rounded-2xl border border-white/12 bg-white/[0.07] p-5 backdrop-blur-md"
                key={bullet}
              >
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFE0A0]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-jp text-[14px] leading-[1.65] text-white/92 sm:text-[15px]">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionWrapper>
  );
}
