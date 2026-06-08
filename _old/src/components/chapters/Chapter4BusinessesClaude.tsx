"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import type { Locale } from "@/i18n/routing";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Chapter4ClaudeItem = {
  accent: "coral" | "navy" | "red";
  body: string;
  cta: string;
  href: string;
  tag: string;
  title: string;
  visual?: "bottle" | "network" | "whatsapp";
};

export type Chapter4ClaudeCopy = {
  items: Chapter4ClaudeItem[];
  lead: string;
  title: string;
};

type Chapter4Props = {
  copy: Chapter4ClaudeCopy;
  locale: Locale;
};

const ACCENT_BG: Record<Chapter4ClaudeItem["accent"], string> = {
  coral:
    "radial-gradient(circle at 30% 25%, rgba(255,107,107,0.28) 0%, transparent 55%)," +
    "radial-gradient(circle at 75% 75%, rgba(255,107,107,0.1) 0%, transparent 60%)",
  navy:
    "radial-gradient(circle at 30% 25%, rgba(31,42,107,0.36) 0%, transparent 55%)," +
    "radial-gradient(circle at 75% 75%, rgba(15,27,61,0.32) 0%, transparent 60%)",
  red:
    "radial-gradient(circle at 30% 25%, rgba(200,16,46,0.26) 0%, transparent 55%)," +
    "radial-gradient(circle at 75% 75%, rgba(200,16,46,0.1) 0%, transparent 60%)",
};

const ACCENT_CHAPTER_ID: Record<Chapter4ClaudeItem["accent"], string> = {
  coral: "ch4-coral",
  navy: "ch4-navy",
  red: "ch4-red",
};

const ACCENT_HUE: Record<Chapter4ClaudeItem["accent"], string> = {
  coral: "var(--color-andes-coral)",
  navy: "var(--color-andes-paper)",
  red: "var(--color-andes-crimson)",
};

function BusinessVisual({
  accent,
  index,
  visual,
}: {
  accent: Chapter4ClaudeItem["accent"];
  index: number;
  visual?: Chapter4ClaudeItem["visual"];
}) {
  const hue = ACCENT_HUE[accent];

  if (visual === "whatsapp") {
    return (
      <div className="relative grid h-[28rem] w-[18rem] place-items-center rounded-[2.4rem] border border-andes-paper/15 bg-andes-paper/[0.04] p-6 backdrop-blur-sm">
        <div className="flex w-full flex-col gap-3 text-[12px] text-andes-paper/85">
          <div className="self-end max-w-[80%] rounded-[1.1rem] bg-andes-paper/12 px-4 py-3 leading-snug">
            日本の保湿クリーム探してる
          </div>
          <div className="self-start max-w-[85%] rounded-[1.1rem] bg-andes-paper/[0.07] px-4 py-3 leading-snug">
            3 つ候補があります。HABA / Curél / FANCL から選べます。
          </div>
          <div
            className="self-end max-w-[60%] rounded-[1.1rem] px-4 py-3 leading-snug"
            style={{ background: `color-mix(in oklab, ${hue} 28%, transparent)` }}
          >
            HABA で
          </div>
          <div className="self-start max-w-[90%] rounded-[1.1rem] bg-andes-paper/[0.07] px-4 py-3 leading-snug">
            注文を確定しました。PIX で R$ 124、4 日後に São Paulo へ。
          </div>
        </div>
      </div>
    );
  }

  if (visual === "bottle") {
    return (
      <svg
        aria-hidden
        className="h-[26rem] w-[14rem]"
        fill="none"
        viewBox="0 0 200 360"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`bottle-fill-${index}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={hue} stopOpacity="0.45" />
            <stop offset="100%" stopColor={hue} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect
          fill="rgba(250,250,247,0.06)"
          height="48"
          rx="8"
          stroke="rgba(250,250,247,0.55)"
          strokeWidth="1.2"
          width="56"
          x="72"
          y="16"
        />
        <path
          d="M62 64H138C146 64 152 70 152 78V330C152 338 146 344 138 344H62C54 344 48 338 48 330V78C48 70 54 64 62 64Z"
          fill={`url(#bottle-fill-${index})`}
          stroke="rgba(250,250,247,0.6)"
          strokeWidth="1.4"
        />
        <line stroke="rgba(250,250,247,0.4)" strokeWidth="1" x1="60" x2="140" y1="120" y2="120" />
        <text
          fill="rgba(250,250,247,0.8)"
          fontFamily="var(--font-display)"
          fontSize="11"
          letterSpacing="0.2em"
          textAnchor="middle"
          x="100"
          y="170"
        >
          J-VITA
        </text>
        <text
          fill="rgba(250,250,247,0.55)"
          fontFamily="var(--font-display)"
          fontSize="9"
          letterSpacing="0.18em"
          textAnchor="middle"
          x="100"
          y="190"
        >
          MANDATO
        </text>
        <circle
          cx="100"
          cy="260"
          fill="none"
          r="22"
          stroke={hue}
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <circle cx="100" cy="260" fill={hue} fillOpacity="0.35" r="10" />
      </svg>
    );
  }

  if (visual === "network") {
    return (
      <svg
        aria-hidden
        className="h-[26rem] w-[26rem]"
        viewBox="0 0 320 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient cx="50%" cy="50%" id={`net-glow-${index}`} r="50%">
            <stop offset="0%" stopColor={hue} stopOpacity="0.18" />
            <stop offset="100%" stopColor={hue} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" fill={`url(#net-glow-${index})`} r="160" />
        {Array.from({ length: 8 }).map((_, edgeIndex) => {
          const angle = (edgeIndex / 8) * Math.PI * 2;
          const x = 160 + Math.cos(angle) * 110;
          const y = 160 + Math.sin(angle) * 110;

          return (
            <g key={edgeIndex}>
              <line
                stroke="rgba(250,250,247,0.35)"
                strokeWidth="0.6"
                x1="160"
                x2={x}
                y1="160"
                y2={y}
              />
              <circle
                cx={x}
                cy={y}
                fill="rgba(250,250,247,0.85)"
                r="3.2"
              />
            </g>
          );
        })}
        <circle
          cx="160"
          cy="160"
          fill="none"
          r="32"
          stroke={hue}
          strokeOpacity="0.7"
          strokeWidth="1"
        />
        <circle cx="160" cy="160" fill="rgba(250,250,247,0.95)" r="6" />
        <text
          fill="rgba(250,250,247,0.85)"
          fontFamily="var(--font-display)"
          fontSize="11"
          fontWeight="500"
          letterSpacing="0.18em"
          textAnchor="middle"
          x="160"
          y="210"
        >
          ANDES PROTOCOL
        </text>
      </svg>
    );
  }

  return (
    <div
      className="relative grid h-56 w-56 place-items-center rounded-full border opacity-90"
      style={{
        background: "color-mix(in oklab, var(--color-andes-paper) 4%, transparent)",
        borderColor: `color-mix(in oklab, ${hue} 32%, transparent)`,
      }}
    >
      <span className="font-display text-[clamp(2.5rem,4vw,3.4rem)] font-light tracking-[-0.04em] text-andes-paper/85">
        0{index + 1}
      </span>
    </div>
  );
}

export function Chapter4BusinessesClaude({ copy, locale }: Chapter4Props) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const subChapters = Array.from(section.querySelectorAll<HTMLElement>("[data-claude-business]"));

      if (reducedMotion) {
        subChapters.forEach((node) => {
          gsap.set(node.querySelectorAll<HTMLElement>("[data-reveal]"), { clearProps: "all", opacity: 1 });
        });

        return;
      }

      const triggers: ScrollTrigger[] = [];

      subChapters.forEach((node) => {
        const reveals = node.querySelectorAll<HTMLElement>("[data-reveal]");

        gsap.set(reveals, { filter: "blur(6px)", opacity: 0, y: 32 });

        triggers.push(
          ScrollTrigger.create({
            once: true,
            start: "top 70%",
            trigger: node,
            onEnter: () => {
              gsap.to(reveals, {
                duration: 0.85,
                ease: "power2.out",
                filter: "blur(0px)",
                opacity: 1,
                stagger: 0.12,
                y: 0,
              });
            },
          }),
        );
      });

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    { dependencies: [reducedMotion, copy.items.map((item) => item.title).join("|")], revertOnUpdate: true, scope: sectionRef },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative overflow-clip text-andes-paper"
      ref={sectionRef}
    >
      <div className="relative px-6 py-24 sm:px-8 sm:py-32 lg:px-[120px]" data-claude-chapter="ch4-hero">
        <div className="mx-auto max-w-7xl">
          <span className="block font-display text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-andes-paper/55 sm:text-[13px] sm:tracking-[0.18em]">
            03 — Portfolio
          </span>
          <h2 className="mt-6 max-w-3xl font-jp text-[clamp(1.7rem,4.6vw,3.8rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-andes-paper">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-xl font-jp text-[15px] leading-[1.65] text-andes-paper/72 sm:text-[17px]">
            {copy.lead}
          </p>
        </div>
      </div>

      {copy.items.map((item, index) => (
        <article
          aria-label={item.title}
          className="relative min-h-[110vh] overflow-clip"
          data-claude-business
          data-claude-chapter={ACCENT_CHAPTER_ID[item.accent]}
          key={item.title}
          style={{ background: ACCENT_BG[item.accent] }}
        >
          <div className="sticky top-0 flex min-h-screen items-center px-6 py-24 sm:px-8 lg:px-[120px]">
            <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div className="min-w-0">
                <span
                  className="block font-display text-[11px] font-light uppercase leading-none tracking-[0.2em] sm:text-[13px] sm:tracking-[0.18em]"
                  data-reveal
                  style={{ color: ACCENT_HUE[item.accent] }}
                >
                  {String(index + 1).padStart(2, "0")} / {item.tag}
                </span>
                <h3
                  className="mt-6 font-jp text-[clamp(2.2rem,5.5vw,4.6rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-andes-paper"
                  data-reveal
                >
                  {item.title}
                </h3>
                <p
                  className="mt-8 max-w-md font-jp text-[16px] leading-[1.65] text-andes-paper/82 sm:text-[18px]"
                  data-reveal
                >
                  {item.body}
                </p>
                <div className="mt-10" data-reveal>
                  <Link
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-andes-paper/40 px-6 py-3 text-sm font-semibold text-andes-paper transition duration-300 ease-andes hover:border-andes-paper hover:bg-andes-paper/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-paper active:scale-[0.97] sm:px-8"
                    href={`/${locale}${item.href}`}
                  >
                    {item.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              <div className="relative hidden min-h-[26rem] items-center justify-center lg:flex" data-reveal>
                <div
                  className="absolute h-80 w-80 rounded-full opacity-25 blur-3xl"
                  style={{ background: ACCENT_HUE[item.accent] }}
                />
                <BusinessVisual accent={item.accent} index={index} visual={item.visual} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
