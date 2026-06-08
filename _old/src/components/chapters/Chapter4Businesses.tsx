"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import type { Locale } from "@/i18n/routing";
import { gsap } from "@/lib/gsap";

export type Chapter4Item = {
  accent: "coral" | "navy" | "red";
  body: string;
  cta: string;
  href: string;
  tag: string;
  title: string;
  visual: "bottle" | "network" | "whatsapp";
};

export type Chapter4Copy = {
  items: [Chapter4Item, Chapter4Item, Chapter4Item];
  lead: string;
  title: string;
};

const accentClass: Record<Chapter4Item["accent"], string> = {
  coral: "var(--color-andes-coral)",
  navy: "var(--color-andes-navy)",
  red: "var(--color-andes-crimson)",
};

export function Chapter4Businesses({ copy, locale }: { copy: Chapter4Copy; locale: Locale }) {
  return (
    <section
      aria-label={copy.title}
      className="relative overflow-clip text-andes-paper"
      data-cinematic-from="var(--color-andes-moss)"
      data-cinematic-to="var(--color-andes-navy)"
    >
      <div className="relative z-10 px-5 pt-24 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-andes-paper/62">{copy.lead}</p>
          <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(3.4rem,9vw,8.4rem)] font-bold leading-[0.86] tracking-[-0.055em]">
            {copy.title}
          </h2>
        </div>
      </div>

      <div className="relative z-10">
        {copy.items.map((item) => (
          <BusinessPanel item={item} key={item.title} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function BusinessPanel({ item, locale }: { item: Chapter4Item; locale: Locale }) {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      if (reducedMotion) {
        gsap.set("[data-business-reveal]", { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.fromTo(
        panel.querySelectorAll("[data-business-reveal]"),
        { opacity: 0, scale: 0.96, y: 60 },
        {
          ease: "none",
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: panel,
            start: "top 72%",
            end: "top 20%",
            scrub: 1,
          },
          stagger: 0.08,
          y: 0,
        },
      );
    },
    { dependencies: [reducedMotion, item.title], scope: panelRef, revertOnUpdate: true },
  );

  return (
    <article
      className="relative min-h-[150vh]"
      ref={panelRef}
      style={{ "--business-accent": accentClass[item.accent] } as CSSProperties}
    >
      <div className="sticky top-0 grid min-h-screen items-center overflow-hidden px-5 py-24 sm:px-8 lg:px-16">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_74%_38%,color-mix(in_oklab,var(--business-accent)_48%,transparent),transparent_32%),linear-gradient(120deg,color-mix(in_oklab,var(--business-accent)_72%,var(--color-andes-deep)),var(--color-andes-deep))]"
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="min-w-0" data-business-reveal>
            <p className="font-body text-xs font-semibold uppercase text-andes-paper/62">{item.tag}</p>
            <h3 className="mt-5 font-display text-[clamp(3.5rem,9vw,9rem)] font-bold leading-[0.82] tracking-[-0.06em]">
              {item.title}
            </h3>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-andes-paper/76">{item.body}</p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center rounded-full border border-andes-paper/35 px-6 text-sm font-semibold text-andes-paper transition duration-300 ease-andes hover:bg-andes-paper hover:text-andes-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-paper active:scale-[0.97]"
              href={`/${locale}${item.href}`}
            >
              {item.cta}
            </Link>
          </div>
          <div data-business-reveal>
            <BusinessVisual visual={item.visual} />
          </div>
        </div>
      </div>
    </article>
  );
}

function BusinessVisual({ visual }: { visual: Chapter4Item["visual"] }) {
  if (visual === "whatsapp") {
    return (
      <svg aria-hidden className="h-auto w-full" viewBox="0 0 620 620">
        <rect width="620" height="620" rx="72" fill="color-mix(in oklab, var(--color-andes-paper) 10%, transparent)" />
        <path d="M154 128H466Q506 128 506 168V452Q506 492 466 492H154Q114 492 114 452V168Q114 128 154 128Z" fill="none" stroke="var(--color-andes-paper)" strokeOpacity=".5" strokeWidth="2" />
        <circle cx="176" cy="178" r="20" fill="var(--business-accent)" />
        <rect x="216" y="162" width="170" height="16" rx="8" fill="var(--color-andes-paper)" opacity=".68" />
        <rect x="162" y="248" width="234" height="38" rx="19" fill="var(--color-andes-paper)" opacity=".18" />
        <rect x="224" y="318" width="234" height="38" rx="19" fill="var(--business-accent)" opacity=".82" />
        <rect x="162" y="392" width="188" height="38" rx="19" fill="var(--color-andes-paper)" opacity=".18" />
      </svg>
    );
  }

  if (visual === "bottle") {
    return (
      <svg aria-hidden className="h-auto w-full" viewBox="0 0 620 620">
        <path d="M292 92H328V164Q328 188 349 205Q390 238 390 294V496Q390 540 346 540H274Q230 540 230 496V294Q230 238 271 205Q292 188 292 164V92Z" fill="none" stroke="var(--color-andes-paper)" strokeOpacity=".72" strokeWidth="3" />
        <rect x="258" y="76" width="104" height="42" rx="16" fill="var(--business-accent)" />
        <rect x="254" y="316" width="112" height="108" rx="22" fill="var(--color-andes-paper)" opacity=".16" />
        <path d="M310 334V406M274 370H346" stroke="var(--color-andes-paper)" strokeWidth="8" strokeLinecap="round" opacity=".76" />
        <circle cx="428" cy="170" r="58" fill="var(--business-accent)" opacity=".34" />
        <circle cx="184" cy="478" r="42" fill="var(--color-andes-paper)" opacity=".13" />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-auto w-full" viewBox="0 0 620 620">
      <circle cx="310" cy="310" r="76" fill="var(--business-accent)" opacity=".86" />
      <circle cx="164" cy="182" r="38" fill="var(--color-andes-paper)" opacity=".18" />
      <circle cx="472" cy="154" r="42" fill="var(--color-andes-paper)" opacity=".18" />
      <circle cx="456" cy="462" r="36" fill="var(--color-andes-paper)" opacity=".18" />
      <circle cx="174" cy="452" r="32" fill="var(--color-andes-paper)" opacity=".18" />
      <path d="M194 202L284 274M436 184L346 274M434 440L348 348M202 434L274 346" stroke="var(--color-andes-paper)" strokeOpacity=".55" strokeWidth="2" />
      <circle cx="310" cy="310" r="174" fill="none" stroke="var(--color-andes-paper)" strokeOpacity=".2" strokeWidth="2" />
    </svg>
  );
}
