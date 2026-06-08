"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap } from "@/lib/gsap";

export type Chapter5Phase = {
  body: string;
  title: string;
  year: string;
};

export type Chapter5Copy = {
  lead: string;
  phases: [Chapter5Phase, Chapter5Phase, Chapter5Phase, Chapter5Phase, Chapter5Phase];
  title: string;
};

export function Chapter5Roadmap({ copy }: { copy: Chapter5Copy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const path = section?.querySelector<SVGPathElement>("[data-roadmap-path]");

      if (!section || !path) {
        return;
      }

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set("[data-roadmap-node]", { opacity: 0.25, scale: 0.92, y: 24 });

      if (reducedMotion) {
        gsap.set(path, { strokeDashoffset: 0 });
        gsap.set("[data-roadmap-node]", { opacity: 1, scale: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      timeline
        .to(path, { ease: "none", strokeDashoffset: 0 })
        .to("[data-roadmap-node]", { ease: "none", opacity: 1, scale: 1, stagger: 0.08, y: 0 }, 0);
    },
    { dependencies: [reducedMotion, copy.title], scope: sectionRef, revertOnUpdate: true },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[200vh] overflow-clip text-andes-paper"
      data-cinematic-from="var(--color-andes-sunset)"
      data-cinematic-to="var(--color-andes-indigo)"
      ref={sectionRef}
    >
      <div className="sticky top-0 z-10 grid min-h-screen items-center overflow-hidden px-5 py-24 sm:px-8 lg:px-16">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-andes-sunset),var(--color-andes-purple)_52%,var(--color-andes-indigo))]"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm text-andes-paper/66">{copy.lead}</p>
            <h2 className="mt-4 font-display text-[clamp(3.4rem,8vw,8rem)] font-bold leading-[0.86] tracking-[-0.055em]">
              {copy.title}
            </h2>
          </div>

          <div className="relative mt-14 overflow-visible">
            <svg aria-hidden className="h-auto w-full overflow-visible" viewBox="0 0 1180 380">
              <path
                d="M60 228C210 98 332 318 470 200C596 92 706 100 832 210C952 315 1038 270 1120 116"
                data-roadmap-path
                fill="none"
                stroke="var(--color-andes-paper)"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <ol className="grid gap-4 md:grid-cols-5">
              {copy.phases.map((phase) => (
                <li
                  className="min-w-0 rounded-md border border-andes-paper/18 bg-andes-paper/8 p-4 backdrop-blur-md"
                  data-roadmap-node
                  key={`${phase.year}-${phase.title}`}
                >
                  <p className="text-sm font-semibold text-andes-paper/60">{phase.year}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight tracking-[-0.03em]">
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-andes-paper/62">{phase.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
