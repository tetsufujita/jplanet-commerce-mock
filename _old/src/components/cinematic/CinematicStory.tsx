"use client";

import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";

import { lerpColor } from "@/components/cinematic/color";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { Chapter1Overture, type Chapter1Copy } from "@/components/chapters/Chapter1Overture";
import { Chapter2WhyNow, type Chapter2Copy } from "@/components/chapters/Chapter2WhyNow";
import { Chapter3TwoLayer, type Chapter3Copy } from "@/components/chapters/Chapter3TwoLayer";
import { Chapter4Businesses, type Chapter4Copy } from "@/components/chapters/Chapter4Businesses";
import { Chapter5Roadmap, type Chapter5Copy } from "@/components/chapters/Chapter5Roadmap";
import { Chapter6Protocol, type Chapter6Copy } from "@/components/chapters/Chapter6Protocol";
import { Chapter7GroupCta, type Chapter7Copy } from "@/components/chapters/Chapter7GroupCta";
import type { Locale } from "@/i18n/routing";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const PaintCanvas = dynamic(
  () => import("@/components/cinematic/PaintCanvas").then((module) => module.PaintCanvas),
  {
    loading: () => null,
    ssr: false,
  },
);

export type CinematicCopy = {
  chapter1: Chapter1Copy;
  chapter2: Chapter2Copy;
  chapter3: Chapter3Copy;
  chapter4: Chapter4Copy;
  chapter5: Chapter5Copy;
  chapter6: Chapter6Copy;
  chapter7: Chapter7Copy;
};

type CinematicStoryProps = {
  copy: CinematicCopy;
  locale: Locale;
};

function readToken(tokenName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
}

function resolveColor(value: string | null) {
  if (!value) {
    return "#060B1F";
  }

  return value.startsWith("var(")
    ? readToken(value.replace("var(", "").replace(")", ""))
    : value;
}

function setDocumentBackground(color: string) {
  gsap.set([document.body, document.documentElement], { backgroundColor: color });
}

function getSectionProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;

  if (travel <= 0) {
    return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
  }

  return Math.min(1, Math.max(0, -rect.top / travel));
}

export function CinematicStory({ copy, locale }: CinematicStoryProps) {
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cinematic-from][data-cinematic-to]"),
    );

    if (sections.length === 0) {
      return;
    }

    if (reducedMotion) {
      setDocumentBackground(resolveColor(sections[sections.length - 1]?.dataset.cinematicTo ?? null));
      return;
    }

    const triggers = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => {
          const from = resolveColor(section.dataset.cinematicFrom ?? null);
          const to = resolveColor(section.dataset.cinematicTo ?? null);

          setDocumentBackground(lerpColor(from, to, getSectionProgress(section)));
        },
      }),
    );

    let frame = 0;
    const sync = () => {
      const active = sections
        .map((section) => {
          const rect = section.getBoundingClientRect();
          const viewport = window.innerHeight;

          return {
            rect,
            section,
            score: Math.abs(rect.top + rect.height * 0.5 - viewport * 0.5),
          };
        })
        .filter(({ rect }) => rect.bottom >= 0 && rect.top <= window.innerHeight)
        .sort((a, b) => a.score - b.score)[0];

      if (active) {
        setDocumentBackground(
          lerpColor(
            resolveColor(active.section.dataset.cinematicFrom ?? null),
            resolveColor(active.section.dataset.cinematicTo ?? null),
            getSectionProgress(active.section),
          ),
        );
      }

      frame = requestAnimationFrame(sync);
    };

    sync();

    return () => {
      cancelAnimationFrame(frame);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (document.fonts) {
      void document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }, []);

  return (
    <StoryFrame>
      <PaintCanvas />
      <Chapter1Overture copy={copy.chapter1} locale={locale} />
      <Chapter2WhyNow copy={copy.chapter2} />
      <Chapter3TwoLayer copy={copy.chapter3} />
      <Chapter4Businesses copy={copy.chapter4} locale={locale} />
      <Chapter5Roadmap copy={copy.chapter5} />
      <Chapter6Protocol copy={copy.chapter6} />
      <Chapter7GroupCta copy={copy.chapter7} locale={locale} />
    </StoryFrame>
  );
}

function StoryFrame({ children }: { children: ReactNode }) {
  return <div className="relative isolate overflow-clip bg-transparent">{children}</div>;
}
