"use client";

import Image from "next/image";
import Link from "next/link";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import type { Locale } from "@/i18n/routing";

export type OnboardingStep = {
  title: string;
  body: string;
};

type Props = {
  locale: Locale;
  eyebrow: string;
  title: string;
  steps: OnboardingStep[];
  cta: { href: string; label: string };
  /** Two side-by-side images on the left (Shopify "iPad + maker" pattern). */
  images: Array<{ src: string; alt: string }>;
};

export function OnboardingStepsV2({
  cta,
  eyebrow,
  images,
  locale,
  steps,
  title,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [headingRef, headingVisible] = useReveal<HTMLDivElement>();
  const [imagesRef, imagesVisible] = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SectionWrapper id="onboarding" label={title} rhythm="large">
      <div
        className="flex flex-col items-center gap-12 text-center"
        ref={headingRef}
        style={fadeUpStyle(headingVisible, 0, reducedMotion)}
      >
        <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-white/55 sm:text-[13px]">
          {eyebrow}
        </span>
        <h2 className="max-w-[20ch] font-jp text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
          {title}
        </h2>
      </div>

      <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div
          className="relative grid h-full grid-cols-2 gap-4 sm:gap-6"
          ref={imagesRef}
          style={fadeUpStyle(imagesVisible, 0.1, reducedMotion)}
        >
          {images.slice(0, 2).map((img, index) => (
            <div
              className={`relative aspect-[4/5] overflow-hidden rounded-[28px] ${
                index === 1 ? "translate-y-12" : ""
              }`}
              key={img.src}
            >
              <Image
                alt={img.alt}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                src={img.src}
                unoptimized
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,20,40,0.1) 0%, rgba(10,20,40,0) 50%, rgba(10,20,40,0.55) 100%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/12"
              />
            </div>
          ))}
        </div>

        <ol className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <StepRow index={index} key={step.title} reducedMotion={reducedMotion} step={step} />
          ))}
          <li className="mt-8">
            <Link
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0A1428] transition hover:bg-white/90 active:scale-[0.97]"
              href={`/${locale}${cta.href}`}
            >
              {cta.label}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </li>
        </ol>
      </div>
    </SectionWrapper>
  );
}

function StepRow({
  index,
  reducedMotion,
  step,
}: {
  index: number;
  reducedMotion: boolean;
  step: OnboardingStep;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>();
  return (
    <li
      className="grid grid-cols-[auto_1fr] items-start gap-6 border-b border-white/10 py-6 last:border-b-0 sm:gap-8"
      ref={ref}
      style={fadeUpStyle(visible, 0.08 * index, reducedMotion)}
    >
      <span className="font-display text-[clamp(1.2rem,1.8vw,1.5rem)] font-medium tracking-[0.04em] text-[#7AE0B5]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="font-jp text-[clamp(1.25rem,1.9vw,1.7rem)] font-bold leading-[1.2] tracking-[-0.02em] text-white">
          {step.title}
        </h3>
        <p className="max-w-[44ch] font-jp text-[14px] leading-[1.7] text-white/68 sm:text-[15px]">
          {step.body}
        </p>
      </div>
    </li>
  );
}
