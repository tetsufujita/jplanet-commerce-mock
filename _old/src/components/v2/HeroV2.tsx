"use client";

import Link from "next/link";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { HeroBackgroundSlideshow, type SlideshowImage } from "@/components/v2/HeroBackgroundSlideshow";
import { HeroBackgroundVideoLoop } from "@/components/v2/HeroBackgroundVideoLoop";
import { LogoMarquee } from "@/components/v2/LogoMarquee";
import { RotatingText } from "@/components/v2/RotatingText";
import { SplitChar } from "@/components/v2/SplitChar";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import type { Locale } from "@/i18n/routing";

export type HeroV2Copy = {
  eyebrow: string;
  line1: string;
  line2: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

type Props = {
  copy: HeroV2Copy;
  locale: Locale;
  /** Optional MP4 source rendered as a full-bleed background video. */
  videoSrc?: string;
  /** Optional list of MP4 sources cycled in a crossfade loop. Wins over videoSrc. */
  videoSrcs?: string[];
  /** Optional poster image shown until the video begins playing. */
  videoPoster?: string;
  /** Optional Ken-Burns photo slideshow used when no video source is provided. */
  backgroundImages?: SlideshowImage[];
  /** When provided, line2 cycles through these phrases instead of using copy.line2. */
  rotatingLine2?: string[];
};

const TRUST_LOGOS = [
  "KOTRA",
  "IVS Kyoto 2026",
  "MEXT",
  "JETRO",
  "Anpec",
  "PRC Brazil",
  "ANVISA",
  "ABComm",
];

export function HeroV2({
  backgroundImages,
  copy,
  locale,
  rotatingLine2,
  videoPoster,
  videoSrc,
  videoSrcs,
}: Props) {
  const hasVideoLoop = videoSrcs && videoSrcs.length > 0;
  const hasBgMedia =
    hasVideoLoop ||
    Boolean(videoSrc) ||
    (backgroundImages && backgroundImages.length > 0);
  const reducedMotion = useReducedMotion();
  const [bodyRef, bodyVisible] = useReveal<HTMLParagraphElement>();
  const [ctaRef, ctaVisible] = useReveal<HTMLDivElement>();
  const [logoRef, logoVisible] = useReveal<HTMLDivElement>();

  return (
    <section
      aria-label={copy.line1}
      className="relative isolate w-full overflow-hidden bg-[#0A1428] text-white"
    >
      {hasVideoLoop ? (
        <HeroBackgroundVideoLoop poster={videoPoster} sources={videoSrcs!} />
      ) : videoSrc ? (
        <video
          aria-hidden
          autoPlay
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          poster={videoPoster}
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : backgroundImages && backgroundImages.length > 0 ? (
        <HeroBackgroundSlideshow images={backgroundImages} />
      ) : null}

      {/* Dark gradient overlay so type stays legible over the media */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: hasBgMedia
            ? "linear-gradient(180deg, rgba(10,20,40,0.55) 0%, rgba(10,20,40,0.35) 40%, rgba(10,20,40,0.92) 100%)," +
              "radial-gradient(80% 60% at 12% 90%, rgba(215,42,42,0.20) 0%, rgba(10,20,40,0) 70%)"
            : "radial-gradient(120% 80% at 50% 10%, rgba(255,255,255,0.04) 0%, rgba(10,20,40,0) 60%)," +
              "radial-gradient(80% 60% at 12% 90%, rgba(215,42,42,0.12) 0%, rgba(10,20,40,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
      />

      <div className="relative z-10 mx-auto flex min-h-[100vh] w-full max-w-[1425px] flex-col justify-between px-6 pb-16 pt-32 sm:px-10 sm:pt-40 lg:px-16 lg:pb-24 lg:pt-[212px]">
        <div className="flex flex-col gap-8 lg:gap-12">
          <span
            className="block font-display text-[11px] font-medium uppercase leading-none tracking-[0.22em] text-[#F0E8C0] sm:text-[13px] sm:tracking-[0.2em]"
            style={fadeUpStyle(true, 0, reducedMotion)}
          >
            {copy.eyebrow}
          </span>

          <h1 className="max-w-[20ch] font-jp text-[clamp(2.9rem,7.2vw,6.2rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white">
            <span className="block">
              <SplitChar delay={0.1} immediate text={copy.line1} />
            </span>
            {rotatingLine2 && rotatingLine2.length > 0 ? (
              <RotatingText
                className="mt-2 block text-white"
                fadeMs={520}
                intervalMs={3000}
                items={rotatingLine2}
              />
            ) : (
              <span className="mt-2 block text-white">
                <SplitChar delay={0.6} immediate text={copy.line2} />
              </span>
            )}
          </h1>

          <p
            className="max-w-[44ch] font-jp text-[clamp(1rem,1.5vw,1.4rem)] font-light leading-[1.55] text-white/72"
            ref={bodyRef}
            style={fadeUpStyle(bodyVisible, 1.3, reducedMotion)}
          >
            {copy.body}
          </p>

          <div
            className="flex flex-wrap items-center gap-4 sm:gap-6"
            ref={ctaRef}
            style={fadeUpStyle(ctaVisible, 1.55, reducedMotion)}
          >
            <Link
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0A1428] transition duration-300 ease-andes hover:bg-white/90 active:scale-[0.97]"
              href={`/${locale}/businesses`}
            >
              {copy.ctaPrimary}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              className="group inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-white/85 transition duration-300 hover:text-white"
              href={`/${locale}/about`}
            >
              {copy.ctaSecondary}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        <div
          className="mt-20 flex flex-col gap-5 lg:mt-32"
          ref={logoRef}
          style={fadeUpStyle(logoVisible, 0.2, reducedMotion)}
        >
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
            Trusted partners
          </span>
          <LogoMarquee
            items={TRUST_LOGOS.map((name) => (
              <span
                className="font-display text-[14px] font-medium uppercase tracking-[0.18em] text-white/70 sm:text-[16px]"
                key={name}
              >
                {name}
              </span>
            ))}
          />
        </div>
      </div>
    </section>
  );
}
