"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { GlassPanel } from "@/components/cinematic/GlassPanel";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter3ClaudeCopy = {
  layer1Body: string;
  layer1Tag: string;
  layer1Title: string;
  layer2Body: string;
  layer2Tag: string;
  layer2Title: string;
  subtitle: string;
  title: string;
};

const FOREST_OVERLAY =
  "radial-gradient(circle at 25% 30%, rgba(74,102,85,0.34) 0%, transparent 55%)," +
  "radial-gradient(circle at 75% 70%, rgba(26,61,46,0.38) 0%, transparent 60%)";

export function Chapter3TwoLayerClaude({ copy }: { copy: Chapter3ClaudeCopy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const connector = section.querySelector<SVGPathElement>("[data-claude-connector]");
      const layer1 = section.querySelector<HTMLElement>("[data-claude-layer='1']");
      const layer2 = section.querySelector<HTMLElement>("[data-claude-layer='2']");
      const heading = section.querySelector<HTMLElement>("[data-claude-heading]");

      if (!connector || !layer1 || !layer2 || !heading) {
        return;
      }

      const length = connector.getTotalLength();

      gsap.set(connector, { strokeDasharray: length, strokeDashoffset: length });

      if (reducedMotion) {
        gsap.set([heading, layer1, layer2], { clearProps: "all", opacity: 1, y: 0 });
        gsap.set(connector, { strokeDashoffset: 0 });

        return;
      }

      gsap.set(heading, { opacity: 0, y: 32 });
      gsap.set(layer1, { opacity: 0, y: 40 });
      gsap.set(layer2, { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          end: "bottom bottom",
          scrub: 1,
          start: "top top",
          trigger: section,
        },
      });

      tl.to(heading, { duration: 0.6, ease: "none", opacity: 1, y: 0 }, 0);
      tl.to(layer1, { duration: 1.4, ease: "none", opacity: 1, y: 0 }, 0.4);
      tl.to(connector, { duration: 1.6, ease: "none", strokeDashoffset: 0 }, 1.6);
      tl.to(layer2, { duration: 1.4, ease: "none", opacity: 1, y: 0 }, 2.6);

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === section) {
            trigger.kill();
          }
        });
      };
    },
    { dependencies: [reducedMotion, copy.title], revertOnUpdate: true, scope: sectionRef },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[230vh] overflow-clip text-andes-paper"
      data-claude-chapter="ch3"
      ref={sectionRef}
      style={{ background: FOREST_OVERLAY }}
    >
      <div className="sticky top-0 flex min-h-screen items-center px-4 sm:px-8 lg:px-16">
        <GlassPanel className="relative z-10" drift={0.3}>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="min-w-0" data-claude-heading>
            <span className="mb-6 block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 sm:text-[13px] sm:tracking-[0.18em]">
              02 — Architecture
            </span>
            <h2 className="font-jp text-[clamp(1.7rem,4.6vw,3.8rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-andes-paper">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-md font-jp text-[15px] leading-[1.65] text-andes-paper/72 sm:text-[17px]">
              {copy.subtitle}
            </p>
          </div>

          <div className="relative">
            <svg
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[2px] -translate-x-1/2 lg:block"
              preserveAspectRatio="none"
              viewBox="0 0 2 240"
            >
              <path
                d="M1 4 L1 236"
                data-claude-connector
                stroke="rgba(250,250,247,0.45)"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>

            <div className="flex flex-col gap-8 lg:gap-12">
              <article
                className="rounded-3xl border border-andes-paper/12 bg-andes-paper/5 p-7 backdrop-blur-sm sm:p-9"
                data-claude-layer="1"
              >
                <span className="font-display text-[11px] font-light uppercase tracking-[0.2em] text-andes-paper/55 sm:text-[12px]">
                  {copy.layer1Tag}
                </span>
                <h3 className="mt-3 font-jp text-[clamp(1.4rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-andes-paper">
                  {copy.layer1Title}
                </h3>
                <p className="mt-4 font-jp text-[15px] leading-[1.65] text-andes-paper/76 sm:text-[16px]">
                  {copy.layer1Body}
                </p>
              </article>

              <article
                className="rounded-3xl border border-andes-paper/12 bg-andes-paper/5 p-7 backdrop-blur-sm sm:p-9"
                data-claude-layer="2"
              >
                <span className="font-display text-[11px] font-light uppercase tracking-[0.2em] text-[var(--color-andes-teal)] sm:text-[12px]">
                  {copy.layer2Tag}
                </span>
                <h3 className="mt-3 font-jp text-[clamp(1.4rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-andes-paper">
                  {copy.layer2Title}
                </h3>
                <p className="mt-4 font-jp text-[15px] leading-[1.65] text-andes-paper/76 sm:text-[16px]">
                  {copy.layer2Body}
                </p>
              </article>
            </div>
          </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
