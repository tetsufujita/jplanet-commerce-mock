"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { GlassPanel } from "@/components/cinematic/GlassPanel";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter6ClaudeCopy = {
  nodes: string[];
  subtitle: string;
  title: string;
  vision: string;
};

const NETWORK_POSITIONS = [
  { x: 18, y: 22 },
  { x: 82, y: 22 },
  { x: 18, y: 78 },
];

const CENTER = { x: 50, y: 50 };

export function Chapter6ProtocolClaude({ copy }: { copy: Chapter6ClaudeCopy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const paths = Array.from(section.querySelectorAll<SVGPathElement>("[data-claude-edge]"));
      const orbits = Array.from(section.querySelectorAll<HTMLElement>("[data-claude-orbit]"));
      const center = section.querySelector<HTMLElement>("[data-claude-center]");
      const heading = section.querySelector<HTMLElement>("[data-claude-protocol-heading]");

      if (paths.length === 0 || !center || !heading) {
        return;
      }

      paths.forEach((path) => {
        const length = path.getTotalLength();

        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      if (reducedMotion) {
        gsap.set(paths, { strokeDashoffset: 0 });
        gsap.set([heading, center, ...orbits], { clearProps: "all", opacity: 1, scale: 1 });

        return;
      }

      gsap.set(heading, { opacity: 0, y: 32 });
      gsap.set(orbits, { opacity: 0, scale: 0.6 });
      gsap.set(center, { opacity: 0, scale: 0.5 });

      const tl = gsap.timeline({
        scrollTrigger: {
          end: "bottom bottom",
          scrub: 1,
          start: "top top",
          trigger: section,
        },
      });

      tl.to(heading, { duration: 0.6, ease: "none", opacity: 1, y: 0 }, 0);
      tl.to(center, { duration: 0.6, ease: "none", opacity: 1, scale: 1 }, 0.4);
      tl.to(
        orbits,
        { duration: 0.8, ease: "none", opacity: 1, scale: 1, stagger: 0.15 },
        0.8,
      );
      tl.to(paths, { duration: 0.9, ease: "none", stagger: 0.12, strokeDashoffset: 0 }, 1.2);

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
      dependencies: [reducedMotion, copy.title, copy.nodes.join("|")],
      revertOnUpdate: true,
      scope: sectionRef,
    },
  );

  const orbitNodes = copy.nodes.slice(0, 3);
  const centerNode = copy.nodes[3] ?? "Andes";

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[240vh] overflow-clip text-andes-paper"
      data-claude-chapter="ch6"
      ref={sectionRef}
    >
      <div className="sticky top-0 flex min-h-screen items-center px-4 sm:px-8 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,241,149,0.06)_0%,transparent_55%)]" />
        <GlassPanel className="relative z-10" drift={-0.3} tone="dark">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="min-w-0" data-claude-protocol-heading>
            <span className="block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-[var(--color-andes-teal)] sm:text-[13px] sm:tracking-[0.18em]">
              05 — Endgame
            </span>
            <h2 className="mt-6 font-jp text-[clamp(1.8rem,4.6vw,3.8rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-andes-paper">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-md font-jp text-[15px] leading-[1.65] text-andes-paper/72 sm:text-[17px]">
              {copy.subtitle}
            </p>
            <p className="mt-8 max-w-md font-display text-[clamp(1rem,1.4vw,1.25rem)] font-light italic leading-[1.45] text-[var(--color-andes-teal)]">
              {copy.vision}
            </p>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[28rem]">
            <svg
              aria-hidden
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 100 100"
            >
              {NETWORK_POSITIONS.map((position, index) => (
                <path
                  d={`M${position.x} ${position.y} Q${(position.x + CENTER.x) / 2} ${(position.y + CENTER.y) / 2 - 12} ${CENTER.x} ${CENTER.y}`}
                  data-claude-edge
                  fill="none"
                  key={`edge-${index}`}
                  stroke="var(--color-andes-teal)"
                  strokeLinecap="round"
                  strokeOpacity="0.55"
                  strokeWidth="0.35"
                />
              ))}
              <circle
                cx={CENTER.x}
                cy={CENTER.y}
                fill="none"
                r="15"
                stroke="var(--color-andes-teal)"
                strokeOpacity="0.25"
                strokeWidth="0.4"
              />
              <circle
                cx={CENTER.x}
                cy={CENTER.y}
                fill="none"
                r="22"
                stroke="var(--color-andes-teal)"
                strokeOpacity="0.12"
                strokeWidth="0.4"
              />
            </svg>

            {orbitNodes.map((node, index) => {
              const position = NETWORK_POSITIONS[index] ?? CENTER;

              return (
                <div
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                  data-claude-orbit
                  key={node}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-andes-paper/35 bg-andes-black/85 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-andes-paper/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="whitespace-nowrap font-display text-[11px] font-light tracking-[0.16em] text-andes-paper/75 sm:text-[12px]">
                    {node}
                  </span>
                </div>
              );
            })}

            <div
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
              data-claude-center
            >
              <span
                className="grid h-20 w-20 place-items-center rounded-full border bg-andes-black/90 font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-andes-paper"
                style={{
                  borderColor: "var(--color-andes-teal)",
                  boxShadow: "0 0 40px rgba(20,241,149,0.45)",
                }}
              >
                {centerNode}
              </span>
              <span className="font-display text-[10px] font-light uppercase tracking-[0.2em] text-[var(--color-andes-teal)]">
                Protocol issuer
              </span>
            </div>
          </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
