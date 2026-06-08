"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap } from "@/lib/gsap";

export type Chapter6Copy = {
  nodes: [string, string, string, string];
  subtitle: string;
  title: string;
  vision: string;
};

export function Chapter6Protocol({ copy }: { copy: Chapter6Copy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      if (reducedMotion) {
        gsap.set("[data-protocol-reveal]", { opacity: 1, scale: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        section.querySelectorAll("[data-protocol-reveal]"),
        { opacity: 0, scale: 0.96, y: 48 },
        {
          ease: "none",
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 62%",
            end: "top 16%",
            scrub: 1,
          },
          stagger: 0.08,
          y: 0,
        },
      );
    },
    { dependencies: [reducedMotion, copy.title], scope: sectionRef, revertOnUpdate: true },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[200vh] overflow-clip text-andes-paper"
      data-cinematic-from="var(--color-andes-black)"
      data-cinematic-to="var(--color-andes-black)"
      data-webgl-mode="network"
      ref={sectionRef}
    >
      <div className="sticky top-0 z-10 grid min-h-screen items-center overflow-hidden px-5 py-24 sm:px-8 lg:px-16">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_oklab,var(--color-andes-teal)_22%,transparent),transparent_34%),linear-gradient(180deg,var(--color-andes-black),color-mix(in_oklab,var(--color-andes-teal)_8%,var(--color-andes-black)))]"
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(20rem,0.72fr)] lg:items-center">
          <div className="min-w-0" data-protocol-reveal>
            <p className="text-sm font-semibold uppercase text-andes-teal">{copy.subtitle}</p>
            <h2 className="mt-5 max-w-[11ch] font-display text-[clamp(3.5rem,8.5vw,8.5rem)] font-bold leading-[0.84] tracking-[-0.06em]">
              {copy.title}
            </h2>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-andes-paper/74">{copy.vision}</p>
          </div>

          <div className="relative min-h-[28rem]" data-protocol-reveal>
            <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 620 520">
              <circle cx="310" cy="260" r="82" fill="var(--color-andes-teal)" opacity=".9" />
              <circle cx="132" cy="118" r="42" fill="var(--color-andes-paper)" opacity=".14" />
              <circle cx="492" cy="122" r="42" fill="var(--color-andes-paper)" opacity=".14" />
              <circle cx="492" cy="402" r="42" fill="var(--color-andes-paper)" opacity=".14" />
              <path d="M170 146L256 218M456 150L364 220M456 374L364 300" stroke="var(--color-andes-teal)" strokeOpacity=".64" strokeWidth="2" />
            </svg>
            <div className="absolute left-[42%] top-[44%] -translate-x-1/2 -translate-y-1/2 text-center font-display text-xl font-semibold text-andes-black">
              {copy.nodes[3]}
            </div>
            <div className="absolute left-[11%] top-[18%] text-sm text-andes-paper/74">{copy.nodes[0]}</div>
            <div className="absolute right-[8%] top-[19%] text-sm text-andes-paper/74">{copy.nodes[1]}</div>
            <div className="absolute bottom-[18%] right-[8%] text-sm text-andes-paper/74">{copy.nodes[2]}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
