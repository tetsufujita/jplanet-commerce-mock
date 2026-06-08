"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef } from "react";

import { GlassPanel } from "@/components/cinematic/GlassPanel";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import type { Locale } from "@/i18n/routing";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter7ClaudeCopy = {
  contactDesc: string;
  contactTitle: string;
  cta: string;
  groupDesc: string;
  groupTitle: string;
  nodes: string[];
  windows: string[];
};

type Chapter7Props = {
  copy: Chapter7ClaudeCopy;
  locale: Locale;
};

export function Chapter7GroupCtaClaude({ copy, locale }: Chapter7Props) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const reveals = Array.from(section.querySelectorAll<HTMLElement>("[data-claude-reveal]"));

      if (reducedMotion) {
        gsap.set(reveals, { clearProps: "all", opacity: 1 });

        return;
      }

      gsap.set(reveals, { filter: "blur(6px)", opacity: 0, y: 28 });

      const trigger = ScrollTrigger.create({
        once: true,
        start: "top 75%",
        trigger: section,
        onEnter: () => {
          gsap.to(reveals, {
            duration: 0.85,
            ease: "power2.out",
            filter: "blur(0px)",
            opacity: 1,
            stagger: 0.1,
            y: 0,
          });
        },
      });

      return () => trigger.kill();
    },
    {
      dependencies: [reducedMotion, copy.contactTitle, copy.groupTitle],
      revertOnUpdate: true,
      scope: sectionRef,
    },
  );

  return (
    <section
      aria-label={copy.contactTitle}
      className="relative px-4 py-24 text-andes-paper sm:px-8 sm:py-32 lg:px-16 lg:py-40"
      data-claude-chapter="ch7"
      ref={sectionRef}
    >
      <GlassPanel className="relative z-10" drift={0} tone="dark">
        <div className="grid gap-20 lg:grid-cols-[1fr_1fr] lg:gap-24">
        <article className="min-w-0">
          <span
            className="block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 sm:text-[13px] sm:tracking-[0.18em]"
            data-claude-reveal
          >
            06 — Group
          </span>
          <h2
            className="mt-6 max-w-md font-jp text-[clamp(1.6rem,3.6vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-andes-paper"
            data-claude-reveal
          >
            {copy.groupTitle}
          </h2>
          <p
            className="mt-5 max-w-md font-jp text-[15px] leading-[1.65] text-andes-paper/72 sm:text-[16px]"
            data-claude-reveal
          >
            {copy.groupDesc}
          </p>
          <ol className="mt-10 space-y-3" data-claude-reveal>
            {copy.nodes.map((node, index) => (
              <li
                className="flex items-center gap-4 border-b border-andes-paper/15 pb-3 last:border-b-0 last:pb-0"
                key={node}
              >
                <span className="font-display text-[11px] font-light uppercase tracking-[0.2em] text-andes-paper/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[15px] font-medium tracking-[-0.01em] text-andes-ink sm:text-[16px]">
                  {node}
                </span>
              </li>
            ))}
          </ol>
        </article>

        <article className="min-w-0">
          <span
            className="block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 sm:text-[13px] sm:tracking-[0.18em]"
            data-claude-reveal
          >
            07 — Contact
          </span>
          <h2
            className="mt-6 max-w-lg font-jp text-[clamp(1.8rem,4.4vw,3.2rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-andes-paper"
            data-claude-reveal
          >
            {copy.contactTitle}
          </h2>
          <p
            className="mt-5 max-w-md font-jp text-[15px] leading-[1.65] text-andes-paper/72 sm:text-[16px]"
            data-claude-reveal
          >
            {copy.contactDesc}
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-3" data-claude-reveal>
            {copy.windows.map((window, index) => (
              <li
                className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-4 text-andes-paper/85 transition duration-300 ease-andes hover:border-andes-paper/30 hover:bg-andes-paper/10 sm:p-5"
                key={window}
              >
                <span className="block font-display text-[10px] font-light uppercase tracking-[0.2em] text-andes-paper/40 sm:text-[11px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 block font-jp text-[14px] font-medium leading-tight text-andes-ink sm:text-[15px]">
                  {window}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-12" data-claude-reveal>
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-andes-navy px-7 py-3 text-sm font-semibold text-andes-paper transition duration-300 ease-andes hover:bg-andes-navy/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-navy active:scale-[0.97] sm:px-10"
              href={`/${locale}/contact`}
            >
              {copy.cta}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </article>
        </div>
      </GlassPanel>
    </section>
  );
}
