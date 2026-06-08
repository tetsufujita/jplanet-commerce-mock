"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import SplitType from "split-type";

import { GlassPanel } from "@/components/cinematic/GlassPanel";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter2ClaudeCopy = {
  eyebrow: string;
  subtitle: string;
  points: string[];
};

type Chapter2WhyNowClaudeProps = {
  copy: Chapter2ClaudeCopy;
};

const SEPIA_OVERLAY =
  "radial-gradient(circle at 30% 40%, rgba(201, 168, 118, 0.22) 0%, transparent 50%)," +
  "radial-gradient(circle at 70% 60%, rgba(168, 149, 103, 0.14) 0%, transparent 55%)";

const FADE_OVERLAY =
  "linear-gradient(180deg, rgba(28,24,18,0) 0%, rgba(28,24,18,0.18) 70%, rgba(28,24,18,0.55) 100%)";

export function Chapter2WhyNowClaude({ copy }: Chapter2WhyNowClaudeProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const pointsRef = useRef<Array<HTMLLIElement | null>>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const overlay = overlayRef.current;
      const eyebrow = eyebrowRef.current;
      const subtitle = subtitleRef.current;
      const points = pointsRef.current.filter((node): node is HTMLLIElement => node !== null);

      if (!section || !content || !eyebrow || !subtitle || points.length === 0) {
        return;
      }

      if (reducedMotion) {
        gsap.set([eyebrow, subtitle, ...points], { clearProps: "all", opacity: 1 });
        if (overlay) {
          gsap.set(overlay, { opacity: 0.85 });
        }

        return;
      }

      const subtitleSplit = new SplitType(subtitle, { types: "lines" });
      const subtitleLines = (subtitleSplit.lines ?? []) as HTMLElement[];

      gsap.set(eyebrow, { filter: "blur(6px)", opacity: 0, y: 32 });
      gsap.set(subtitleLines, { filter: "blur(6px)", opacity: 0, y: 32 });
      gsap.set(points, { opacity: 0, y: 24 });
      if (overlay) {
        gsap.set(overlay, { opacity: 0.6 });
      }
      gsap.set(content, { scale: 1, y: 0 });

      const entryTrigger = ScrollTrigger.create({
        once: true,
        start: "top 80%",
        trigger: section,
        onEnter: () => {
          const tl = gsap.timeline();

          tl.to(eyebrow, {
            delay: 0.1,
            duration: 0.8,
            ease: "power2.out",
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
          });
          tl.to(
            subtitleLines,
            {
              duration: 0.85,
              ease: "power2.out",
              filter: "blur(0px)",
              opacity: 1,
              stagger: 0.12,
              y: 0,
            },
            "-=0.55",
          );
          tl.to(
            points,
            {
              duration: 0.65,
              ease: "power2.out",
              opacity: 1,
              stagger: 0.15,
              y: 0,
            },
            "-=0.35",
          );
        },
      });

      const scrubTrigger = ScrollTrigger.create({
        end: "bottom bottom",
        scrub: 1,
        start: "top top",
        trigger: section,
        onUpdate: (self) => {
          const progress = self.progress;

          gsap.set(content, {
            scale: 1 - progress * 0.04,
            y: -32 * progress,
          });
          if (overlay) {
            gsap.set(overlay, { opacity: 0.6 + progress * 0.32 });
          }
        },
      });

      return () => {
        entryTrigger.kill();
        scrubTrigger.kill();
        subtitleSplit.revert();
      };
    },
    {
      dependencies: [reducedMotion, copy.eyebrow, copy.subtitle, copy.points.join("|")],
      revertOnUpdate: true,
      scope: sectionRef,
    },
  );

  return (
    <section
      aria-label={copy.eyebrow}
      className="relative min-h-[200vh] overflow-clip text-andes-paper lg:min-h-[250vh]"
      data-claude-chapter="ch2"
      ref={sectionRef}
      style={{ background: SEPIA_OVERLAY }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        ref={overlayRef}
        style={{ background: FADE_OVERLAY }}
      />
      <div className="sticky top-0 flex min-h-screen items-center px-4 sm:px-8 lg:px-16">
        <GlassPanel className="relative z-10" drift={-0.3}>
          <div
            className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20"
            ref={contentRef}
          >
            <div className="min-w-0">
              <span
                className="mb-6 block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 sm:mb-8 sm:text-[13px] sm:tracking-[0.18em]"
                ref={eyebrowRef}
              >
                {copy.eyebrow}
              </span>
              <h2
                className="max-w-[16ch] font-jp text-[clamp(1.6rem,4vw,3.2rem)] font-semibold leading-[1.22] tracking-[-0.025em] text-andes-paper text-balance sm:max-w-[20ch]"
                ref={subtitleRef}
              >
                {copy.subtitle}
              </h2>
            </div>
            <ol className="flex flex-col gap-8 lg:gap-12">
              {copy.points.map((point, index) => (
                <li
                  className="max-w-md"
                  key={point}
                  ref={(node) => {
                    pointsRef.current[index] = node;
                  }}
                >
                  <span className="mb-3 block font-display text-[11px] font-light leading-none tracking-[0.2em] text-andes-sepia sm:text-[13px] sm:tracking-[0.18em]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-jp text-[15px] leading-[1.62] tracking-[-0.005em] text-andes-paper/85 sm:text-[17px] sm:leading-[1.65] lg:text-[18px]">
                    {point}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
