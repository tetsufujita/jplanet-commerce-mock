"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import SplitType from "split-type";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter2Copy = {
  points: [string, string, string];
  subtitle: string;
  title: string;
};

export function Chapter2WhyNow({ copy }: { copy: Chapter2Copy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const pointRefs = useRef<Array<HTMLLIElement | null>>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const overlay = overlayRef.current;
      const eyebrow = eyebrowRef.current;
      const subtitle = subtitleRef.current;
      const points = pointRefs.current.filter((point): point is HTMLLIElement => point !== null);

      if (!section || !content || !overlay || !eyebrow || !subtitle || points.length === 0) {
        return;
      }

      if (reducedMotion) {
        gsap.set([eyebrow, subtitle, ...points], {
          clearProps: "filter,transform",
          opacity: 1,
        });
        gsap.set(content, { clearProps: "transform" });
        gsap.set(overlay, { opacity: 0.78 });
        return;
      }

      const subtitleSplit = new SplitType(subtitle, { types: "lines" });
      const subtitleLines = subtitleSplit.lines ?? [];

      gsap.set(eyebrow, { filter: "blur(6px)", opacity: 0, y: 32 });
      gsap.set(subtitle, { opacity: 1 });
      gsap.set(subtitleLines, { filter: "blur(6px)", opacity: 0, y: 32 });
      gsap.set(points, { opacity: 0, y: 24 });
      gsap.set(content, { scale: 1, transformOrigin: "center center", y: 0 });
      gsap.set(overlay, { opacity: 0.6 });

      const entryTrigger = ScrollTrigger.create({
        once: true,
        start: "top 80%",
        trigger: section,
        onEnter: () => {
          const timeline = gsap.timeline();

          timeline
            .to(eyebrow, {
              delay: 0.1,
              duration: 0.8,
              ease: "expo.out",
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
            })
            .to(
              subtitleLines,
              {
                duration: 0.8,
                ease: "expo.out",
                filter: "blur(0px)",
                opacity: 1,
                stagger: 0.08,
                y: 0,
              },
              "-=0.56",
            )
            .to(
              points,
              {
                duration: 0.65,
                ease: "expo.out",
                opacity: 1,
                stagger: 0.15,
                y: 0,
              },
              "-=0.28",
            );
        },
      });

      const scrubTimeline = gsap.timeline({
        scrollTrigger: {
          end: "bottom bottom",
          scrub: 1,
          start: "top top",
          trigger: section,
        },
      });

      scrubTimeline
        .to(content, { duration: 1, ease: "none", scale: 0.96, y: -32 }, 0)
        .to(overlay, { duration: 1, ease: "none", opacity: 0.95 }, 0);

      return () => {
        entryTrigger.kill();
        scrubTimeline.kill();
        subtitleSplit.revert();
      };
    },
    {
      dependencies: [reducedMotion, copy.title, copy.subtitle, copy.points.join("|")],
      revertOnUpdate: true,
      scope: sectionRef,
    },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[200vh] overflow-clip bg-[rgb(28,24,18)] text-andes-paper lg:min-h-[250vh]"
      data-chapter="why-now"
      data-cinematic-from="var(--color-andes-dawn)"
      data-cinematic-to="var(--color-gray-900)"
      ref={sectionRef}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(201,168,118,0.18)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,149,103,0.12)_0%,transparent_55%),rgb(28,24,18)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,24,18,0)_0%,rgba(28,24,18,0.4)_50%,rgba(28,24,18,0.85)_100%)] opacity-60"
        ref={overlayRef}
      />

      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden">
        <div
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-24 md:px-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-[120px] lg:py-0"
          ref={contentRef}
        >
          <div className="min-w-0">
            <span
              className="mb-8 block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 lg:mb-8 lg:text-[13px] lg:tracking-[0.18em]"
              ref={eyebrowRef}
            >
              {copy.title}
            </span>
            <h2
              className="max-w-full font-jp text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] text-andes-paper opacity-0 lg:max-w-[540px] lg:text-[56px] lg:leading-[1.15]"
              ref={subtitleRef}
            >
              {copy.subtitle}
            </h2>
          </div>

          <ol className="flex flex-col gap-10 lg:gap-14">
            {copy.points.map((point, index) => (
              <li
                className="max-w-full lg:max-w-[380px]"
                key={point}
                ref={(node) => {
                  pointRefs.current[index] = node;
                }}
              >
                <span className="mb-3 block font-display text-[11px] font-light leading-none tracking-[0.2em] text-andes-sepia lg:text-[13px] lg:tracking-[0.18em]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-jp text-[15px] font-normal leading-[1.6] tracking-[-0.005em] text-andes-paper/85 lg:text-[18px] lg:leading-[1.65]">
                  {point}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
