"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef } from "react";
import SplitType from "split-type";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import type { Locale } from "@/i18n/routing";
import { gsap } from "@/lib/gsap";

export type Chapter1Copy = {
  line1: string;
  line2: string;
  line3: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

type Chapter1OvertureProps = {
  copy: Chapter1Copy;
  locale: Locale;
};

const lineReveal = {
  duration: 0.7,
  ease: "expo.out",
  filter: "blur(0px)",
  opacity: 1,
  stagger: 0.025,
  y: 0,
};

export function Chapter1Overture({ copy, locale }: Chapter1OvertureProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const dawnGlowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const line1 = line1Ref.current;
      const line2 = line2Ref.current;
      const line3 = line3Ref.current;
      const cta = ctaRef.current;
      const dawnGlow = dawnGlowRef.current;

      if (!section || !content || !line1 || !line2 || !line3 || !cta || !dawnGlow) {
        return;
      }

      if (reducedMotion) {
        gsap.set([line1, line2, cta], {
          clearProps: "filter,transform",
          opacity: 1,
        });
        gsap.set(line3, {
          clearProps: "filter,transform",
          opacity: 0.62,
        });
        gsap.set(content, {
          clearProps: "transform",
          opacity: 1,
        });
        gsap.set(dawnGlow, { opacity: 0.5 });
        return;
      }

      const splits = [line1, line2].map((line, index) => {
        const split = new SplitType(line, { types: "words,chars" });
        const chars = split.chars ?? [];

        gsap.set(line, { opacity: 1 });
        gsap.set(split.words ?? [], {
          display: "inline-block",
          whiteSpace: "nowrap",
        });
        gsap.set(chars, {
          display: "inline-block",
          filter: "blur(6px)",
          opacity: 0,
          y: 24,
        });
        gsap.to(chars, {
          ...lineReveal,
          delay: index === 0 ? 0.4 : 1.4,
          onComplete: () => {
            gsap.set(chars, { clearProps: "filter,transform" });
          },
        });

        return split;
      });

      gsap.fromTo(
        line3,
        { opacity: 0, y: 16 },
        {
          delay: 2.4,
          duration: 0.6,
          ease: "expo.out",
          opacity: 0.62,
          y: 0,
        },
      );
      gsap.fromTo(
        cta,
        { opacity: 0, y: 12 },
        {
          delay: 3.2,
          duration: 0.6,
          ease: "expo.out",
          opacity: 1,
          y: 0,
        },
      );

      gsap.set(content, { transformOrigin: "left center" });
      gsap.set(dawnGlow, { opacity: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      timeline
        .to(content, { duration: 1, ease: "none", scale: 0.92, y: -40 }, 0)
        .to(content, { duration: 0.3, ease: "none", opacity: 0 }, 0.6)
        .to(dawnGlow, { duration: 0.2, ease: "none", opacity: 0.4 }, 0.6)
        .to(dawnGlow, { duration: 0.2, ease: "none", opacity: 0.85 }, 0.8);

      return () => {
        splits.forEach((split) => split.revert());
      };
    },
    {
      dependencies: [
        reducedMotion,
        copy.line1,
        copy.line2,
        copy.line3,
        copy.ctaPrimary,
        copy.ctaSecondary,
      ],
      revertOnUpdate: true,
      scope: sectionRef,
    },
  );

  return (
    <section
      aria-label={copy.line1}
      className="relative min-h-[300vh] overflow-clip bg-andes-midnight text-andes-paper"
      data-cinematic-from="var(--color-andes-midnight)"
      data-cinematic-to="var(--color-andes-midnight)"
      data-webgl-mode="paint"
      ref={sectionRef}
    >
      <div className="pointer-events-none sticky top-0 z-10 flex min-h-screen items-center overflow-hidden px-0 py-0">
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[40vh] bg-[radial-gradient(ellipse_at_50%_100%,var(--color-andes-dawn)_0%,transparent_70%)] opacity-0 mix-blend-screen"
          ref={dawnGlowRef}
        />
        <div className="w-full px-6 md:px-12 lg:pl-[120px] lg:pr-6">
          <div className="max-w-[760px]" ref={contentRef}>
            <h1
              aria-label={`${copy.line1} ${copy.line2}`}
              className="font-jp text-[40px] font-bold leading-[1.08] tracking-[-0.03em] text-andes-paper md:text-[88px] md:leading-[1.02] md:tracking-[-0.04em]"
            >
              <span
                className="block overflow-visible opacity-0 text-balance md:whitespace-nowrap"
                ref={line1Ref}
              >
                {copy.line1}
              </span>
              <span
                className="block overflow-visible opacity-0 text-balance md:whitespace-nowrap"
                ref={line2Ref}
              >
                {copy.line2}
              </span>
            </h1>

            <p
              className="mt-12 max-w-full font-jp text-[15px] font-medium leading-[1.55] tracking-[-0.005em] text-andes-paper opacity-0 md:mt-16 md:max-w-[540px] md:text-[22px] md:tracking-[-0.01em]"
              ref={line3Ref}
            >
              {copy.line3}
            </p>

            <div
              className="pointer-events-auto mt-10 flex flex-col gap-2.5 opacity-0 sm:flex-row md:mt-14 md:gap-3"
              ref={ctaRef}
            >
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-andes-paper px-6 py-3 text-[13px] font-semibold tracking-[0.01em] text-andes-deep transition-opacity duration-300 ease-andes hover:opacity-[0.88] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-paper md:px-7 md:py-3.5 md:text-sm"
                href={`/${locale}/businesses`}
              >
                {copy.ctaPrimary}
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-andes-paper/32 bg-transparent px-6 py-3 text-[13px] font-semibold tracking-[0.01em] text-andes-paper transition-colors duration-300 ease-andes hover:border-andes-paper/60 hover:bg-andes-paper/8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-paper md:px-7 md:py-3.5 md:text-sm"
                href={`/${locale}/about`}
              >
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
