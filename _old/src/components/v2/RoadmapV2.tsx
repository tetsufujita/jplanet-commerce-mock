"use client";

import Image from "next/image";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionHeading } from "@/components/v2/SectionHeading";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";

export type RoadmapPhase = {
  /** "Phase 1" etc. */
  label: string;
  /** "2026" */
  year: string;
  /** Short title */
  title: string;
  /** Body sentence */
  body: string;
};

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  phases: RoadmapPhase[];
  /** Optional feature image rendered as a wide band above the timeline. */
  featureImage?: { src: string; alt: string };
};

export function RoadmapV2({ body, eyebrow, featureImage, phases, title }: Props) {
  const reducedMotion = useReducedMotion();
  const [trackRef, trackVisible] = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SectionWrapper id="roadmap" label={title}>
      <SectionHeading body={body} eyebrow={eyebrow} title={title} />

      {featureImage ? (
        <div className="relative mt-14 aspect-[16/7] w-full overflow-hidden rounded-[28px] lg:mt-20">
          <Image
            alt={featureImage.alt}
            className="object-cover"
            fill
            sizes="100vw"
            src={featureImage.src}
            unoptimized
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,20,40,0.15) 0%, rgba(10,20,40,0) 35%, rgba(10,20,40,0) 65%, rgba(10,20,40,0.55) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/12"
          />
        </div>
      ) : null}

      <div
        className="mt-16 lg:mt-24"
        ref={trackRef}
        style={fadeUpStyle(trackVisible, 0.05, reducedMotion)}
      >
        {/* Horizontal connector line (desktop) */}
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-[18px] hidden h-px bg-white/14 lg:block"
          />
          <ol className="grid gap-12 lg:grid-cols-5 lg:gap-6">
            {phases.map((phase, index) => (
              <PhaseNode
                index={index}
                key={`${phase.label}-${phase.year}`}
                phase={phase}
                reducedMotion={reducedMotion}
                total={phases.length}
              />
            ))}
          </ol>
        </div>
      </div>
    </SectionWrapper>
  );
}

function PhaseNode({
  index,
  phase,
  reducedMotion,
  total,
}: {
  index: number;
  phase: RoadmapPhase;
  reducedMotion: boolean;
  total: number;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>();

  return (
    <li
      className="relative flex flex-col gap-4"
      ref={ref}
      style={fadeUpStyle(visible, 0.08 * index, reducedMotion)}
    >
      {/* Node dot */}
      <span
        aria-hidden
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-[#0A1428]"
      >
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
        {phase.label} {index === total - 1 ? "+" : ""}
      </span>
      <span className="font-display text-[clamp(1.6rem,2.2vw,2.1rem)] font-light leading-none tracking-[-0.02em] text-white">
        {phase.year}
      </span>
      <h3 className="font-jp text-[15px] font-medium leading-[1.4] text-white/95 sm:text-[16px]">
        {phase.title}
      </h3>
      <p className="font-jp text-[13px] leading-[1.6] text-white/64 sm:text-[14px]">
        {phase.body}
      </p>
    </li>
  );
}
