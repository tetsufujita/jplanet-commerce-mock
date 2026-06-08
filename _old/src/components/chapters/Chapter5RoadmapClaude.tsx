"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { GlassPanel } from "@/components/cinematic/GlassPanel";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter5ClaudePhase = {
  body: string;
  title: string;
  year: string;
};

export type Chapter5ClaudeCopy = {
  lead: string;
  phases: Chapter5ClaudePhase[];
  title: string;
};

const SUNSET_OVERLAY =
  "radial-gradient(circle at 12% 90%, rgba(255,107,53,0.4) 0%, transparent 55%)," +
  "radial-gradient(circle at 88% 12%, rgba(31,42,107,0.32) 0%, transparent 60%)," +
  "linear-gradient(160deg, rgba(107,79,143,0.22) 0%, rgba(31,42,107,0.18) 60%, transparent 100%)";

export function Chapter5RoadmapClaude({ copy }: { copy: Chapter5ClaudeCopy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const timelinePath = section.querySelector<SVGPathElement>("[data-claude-timeline]");
      const nodes = Array.from(section.querySelectorAll<HTMLElement>("[data-claude-phase]"));
      const heading = section.querySelector<HTMLElement>("[data-claude-roadmap-heading]");

      if (!timelinePath || nodes.length === 0 || !heading) {
        return;
      }

      const length = timelinePath.getTotalLength();

      gsap.set(timelinePath, { strokeDasharray: length, strokeDashoffset: length });

      if (reducedMotion) {
        gsap.set([heading, ...nodes], { clearProps: "all", opacity: 1, y: 0 });
        gsap.set(timelinePath, { strokeDashoffset: 0 });

        return;
      }

      gsap.set(heading, { opacity: 0, y: 32 });
      gsap.set(nodes, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          end: "bottom bottom",
          scrub: 1,
          start: "top top",
          trigger: section,
        },
      });

      tl.to(heading, { duration: 0.5, ease: "none", opacity: 1, y: 0 }, 0);
      tl.to(timelinePath, { duration: 2, ease: "none", strokeDashoffset: 0 }, 0.3);
      tl.to(nodes, { duration: 1.5, ease: "none", opacity: 1, stagger: 0.18, y: 0 }, 0.5);

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === section) {
            trigger.kill();
          }
        });
      };
    },
    {
      dependencies: [reducedMotion, copy.title, copy.phases.map((p) => p.title).join("|")],
      revertOnUpdate: true,
      scope: sectionRef,
    },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[220vh] overflow-clip text-andes-paper"
      data-claude-chapter="ch5"
      ref={sectionRef}
      style={{ background: SUNSET_OVERLAY }}
    >
      <div className="sticky top-0 flex min-h-screen items-center px-4 py-12 sm:px-8 lg:px-16">
        <GlassPanel className="relative z-10" drift={0.2}>
          <div className="w-full">
          <div className="mb-12 lg:mb-16" data-claude-roadmap-heading>
            <span className="block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 sm:text-[13px] sm:tracking-[0.18em]">
              04 — Roadmap
            </span>
            <h2 className="mt-6 max-w-3xl font-jp text-[clamp(1.7rem,4.4vw,3.6rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-andes-paper">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl font-jp text-[15px] leading-[1.65] text-andes-paper/72 sm:text-[17px]">
              {copy.lead}
            </p>
          </div>

          <div className="relative">
            <svg
              aria-hidden
              className="hidden h-12 w-full lg:block"
              preserveAspectRatio="none"
              viewBox="0 0 1200 60"
            >
              <path
                d="M40 30 Q300 30 600 30 T1160 30"
                data-claude-timeline
                fill="none"
                stroke="var(--color-andes-paper)"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <svg
              aria-hidden
              className="block h-[60vh] w-12 lg:hidden"
              preserveAspectRatio="none"
              viewBox="0 0 60 1200"
            >
              <path
                d="M30 40 Q30 300 30 600 T30 1160"
                data-claude-timeline
                fill="none"
                stroke="var(--color-andes-paper)"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>

            <ol className="mt-10 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-5 lg:gap-6">
              {copy.phases.map((phase, index) => (
                <li
                  className="flex flex-col gap-3"
                  data-claude-phase
                  key={phase.title}
                >
                  <span className="font-display text-[11px] font-light uppercase tracking-[0.2em] text-andes-paper/60 sm:text-[12px]">
                    Phase {index + 1}
                  </span>
                  <span className="font-display text-[clamp(1.8rem,2.6vw,2.4rem)] font-light leading-none tracking-[-0.03em] text-andes-paper">
                    {phase.year}
                  </span>
                  <h3 className="font-jp text-[15px] font-semibold leading-[1.3] text-andes-paper sm:text-[16px]">
                    {phase.title}
                  </h3>
                  <p className="font-jp text-[13px] leading-[1.6] text-andes-paper/72 sm:text-[14px]">
                    {phase.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
