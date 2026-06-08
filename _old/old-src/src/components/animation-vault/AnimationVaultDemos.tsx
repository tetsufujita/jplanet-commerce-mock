"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { Locale } from "@/i18n/routing";
import { cx } from "@/lib/classnames";

import { AnimatedBeam } from "./motion/AnimatedBeam";
import { NumberTicker } from "./motion/NumberTicker";
import { Particles } from "./motion/Particles";

type DemoCopy = {
  beam: {
    title: string;
    description: string;
    worldAi: string;
    andes: string;
    brand: string;
    consumer: string;
    customs: string;
  };
  ticker: {
    title: string;
    description: string;
    marketLabel: string;
    marketSuffix: string;
    launchLabel: string;
    flowLabel: string;
  };
  particles: {
    title: string;
    description: string;
    corridor: string;
    tokyo: string;
    saoPaulo: string;
  };
  native: {
    title: string;
    description: string;
    typeTitle: string;
    arcTitle: string;
    flowTitle: string;
    productTitle: string;
    typeLine1: string;
    typeLine2: string;
    typeLine3: string;
    productBadge: string;
  };
  fluid: {
    title: string;
    description: string;
    status: string;
    cursor: string;
    fallback: string;
    note: string;
  };
};

type AnimationVaultDemosProps = {
  copy: DemoCopy;
  locale: Locale;
};

export function AnimationVaultDemos({ copy, locale }: AnimationVaultDemosProps) {
  return (
    <section className="border-y border-andes-paper/12 bg-andes-deep px-5 py-20 text-andes-paper sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
        <BeamDemo copy={copy.beam} />
        <TickerDemo copy={copy.ticker} locale={locale} />
        <ParticleDemo copy={copy.particles} />
      </div>
      <NativeMotionStrip copy={copy.native} />
      <FluidLabDemo copy={copy.fluid} />
    </section>
  );
}

function BeamDemo({ copy }: { copy: DemoCopy["beam"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldAiRef = useRef<HTMLDivElement>(null);
  const andesRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const consumerRef = useRef<HTMLDivElement>(null);
  const customsRef = useRef<HTMLDivElement>(null);

  return (
    <article className="relative min-h-[470px] overflow-hidden rounded-lg border border-andes-paper/14 bg-andes-paper/[0.045] p-5">
      <DemoHeader description={copy.description} title={copy.title} />
      <div className="relative mt-8 h-[310px] text-andes-paper/60" ref={containerRef}>
        <AnimatedBeam containerRef={containerRef} curvature={42} fromRef={worldAiRef} pathOpacity={0.18} toRef={andesRef} />
        <AnimatedBeam containerRef={containerRef} curvature={-34} delay={0.4} fromRef={brandRef} pathOpacity={0.18} toRef={andesRef} />
        <AnimatedBeam containerRef={containerRef} curvature={48} delay={0.8} fromRef={andesRef} pathOpacity={0.16} toRef={consumerRef} />
        <AnimatedBeam containerRef={containerRef} curvature={-54} delay={1.2} fromRef={andesRef} pathOpacity={0.16} toRef={customsRef} />

        <VaultNode className="left-0 top-7" label={copy.worldAi} nodeRef={worldAiRef} tone="quiet" />
        <VaultNode className="left-0 bottom-10" label={copy.brand} nodeRef={brandRef} tone="quiet" />
        <VaultNode className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" label={copy.andes} nodeRef={andesRef} tone="core" />
        <VaultNode className="right-0 top-8" label={copy.consumer} nodeRef={consumerRef} tone="quiet" />
        <VaultNode className="right-0 bottom-10" label={copy.customs} nodeRef={customsRef} tone="quiet" />
      </div>
    </article>
  );
}

function TickerDemo({ copy, locale }: { copy: DemoCopy["ticker"]; locale: Locale }) {
  return (
    <article className="relative min-h-[470px] overflow-hidden rounded-lg border border-andes-paper/14 bg-andes-paper/[0.055] p-5">
      <DemoHeader description={copy.description} title={copy.title} />
      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-andes-paper/12 bg-andes-paper/12">
        <MetricRow label={copy.marketLabel}>
          <NumberTicker className="font-display text-5xl font-semibold leading-none sm:text-6xl" locale={locale} value={6.6} decimalPlaces={1} />
          <span className="ml-2 font-display text-xl font-semibold text-andes-paper/68">{copy.marketSuffix}</span>
        </MetricRow>
        <MetricRow label={copy.launchLabel}>
          <NumberTicker className="font-display text-5xl font-semibold leading-none sm:text-6xl" locale={locale} value={2026} />
        </MetricRow>
        <MetricRow label={copy.flowLabel}>
          <NumberTicker className="font-display text-5xl font-semibold leading-none sm:text-6xl" locale={locale} value={4} />
        </MetricRow>
      </div>
    </article>
  );
}

function ParticleDemo({ copy }: { copy: DemoCopy["particles"] }) {
  return (
    <article className="relative min-h-[470px] overflow-hidden rounded-lg border border-andes-paper/14 bg-andes-paper/[0.045] p-5">
      <Particles className="absolute inset-0 opacity-70" quantity={92} size={0.35} staticity={42} vy={0.02} />
      <div className="relative z-10">
        <DemoHeader description={copy.description} title={copy.title} />
        <div className="mt-12">
          <div className="text-xs font-semibold uppercase text-andes-paper/48">{copy.corridor}</div>
          <div className="mt-5 flex items-center gap-3">
            <CityDot label={copy.tokyo} />
            <div className="h-px min-w-0 flex-1 bg-andes-paper/22">
              <div className="h-px w-full origin-left bg-andes-crimson motion-safe:animate-pulse" />
            </div>
            <CityDot label={copy.saoPaulo} />
          </div>
        </div>
      </div>
    </article>
  );
}

function DemoHeader({ description, title }: { description: string; title: string }) {
  return (
    <header>
      <h2 className="font-display text-2xl font-semibold leading-tight text-andes-paper">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-andes-paper/62">{description}</p>
    </header>
  );
}

function MetricRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="bg-andes-deep/88 p-5">
      <div className="text-xs font-semibold uppercase text-andes-paper/44">{label}</div>
      <div className="mt-4 flex items-end text-andes-paper">{children}</div>
    </div>
  );
}

const VaultNode = ({
  className,
  label,
  nodeRef,
  tone,
}: {
  className?: string;
  label: string;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  tone: "core" | "quiet";
}) => (
  <div
    className={cx(
      "absolute grid min-h-16 w-28 place-items-center rounded-lg border px-3 text-center text-xs font-semibold leading-4 text-andes-paper shadow-[0_18px_60px_rgba(0,0,0,0.18)]",
      tone === "core"
        ? "border-andes-crimson/60 bg-andes-crimson text-andes-paper"
        : "border-andes-paper/18 bg-andes-deep",
      className,
    )}
    ref={nodeRef}
  >
    {label}
  </div>
);

function CityDot({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-andes-paper">
      <span className="size-2 rounded-full bg-andes-crimson" />
      {label}
    </div>
  );
}

function NativeMotionStrip({ copy }: { copy: DemoCopy["native"] }) {
  return (
    <div className="mx-auto mt-4 max-w-7xl rounded-lg border border-andes-paper/14 bg-andes-paper/[0.04] p-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)]">
        <header>
          <h2 className="font-display text-2xl font-semibold leading-tight text-andes-paper">{copy.title}</h2>
          <p className="mt-3 text-sm leading-6 text-andes-paper/62">{copy.description}</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniDemo title={copy.typeTitle}>
            <div className="space-y-1 pt-1 font-display text-3xl font-semibold leading-none tracking-[-0.04em]">
              <TypeLiftLine delay={0.1}>{copy.typeLine1}</TypeLiftLine>
              <TypeLiftLine delay={0.22}>{copy.typeLine2}</TypeLiftLine>
              <TypeLiftLine delay={0.34}>{copy.typeLine3}</TypeLiftLine>
            </div>
          </MiniDemo>

          <MiniDemo title={copy.arcTitle}>
            <svg aria-hidden className="mt-3 h-28 w-full" fill="none" viewBox="0 0 260 112">
              <motion.path
                animate={{ pathLength: [0, 1, 1] }}
                d="M20 88 C 82 8, 178 10, 238 70"
                initial={{ pathLength: 0 }}
                stroke="rgba(250,250,247,0.58)"
                strokeLinecap="round"
                strokeWidth="1.5"
                transition={{ duration: 2.7, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 1.4 }}
              />
              <circle cx="20" cy="88" fill="var(--color-andes-crimson)" r="4" />
              <circle cx="238" cy="70" fill="var(--color-andes-crimson)" r="4" />
            </svg>
          </MiniDemo>

          <MiniDemo title={copy.flowTitle}>
            <div className="relative mt-8 flex items-center gap-3">
              <span className="size-9 rounded-lg border border-andes-paper/18 bg-andes-paper/8" />
              <svg aria-hidden className="h-px min-w-0 flex-1" fill="none" viewBox="0 0 220 2">
                <line
                  className="motion-safe:net-flow"
                  stroke="rgba(250,250,247,0.62)"
                  strokeDasharray="2 10"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  x1="0"
                  x2="220"
                  y1="1"
                  y2="1"
                />
              </svg>
              <span className="relative size-9 rounded-lg border border-andes-paper/18 bg-andes-paper/8">
                <span className="net-pulse absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-andes-crimson" />
              </span>
            </div>
          </MiniDemo>

          <MiniDemo title={copy.productTitle}>
            <div className="vault-product-cycle relative mt-4 h-28 overflow-hidden rounded-lg border border-andes-paper/12 bg-andes-paper/[0.035]">
              <span className="cycle-card cycle-card-a absolute left-4 top-5 h-16 w-28 rounded-lg border border-andes-paper/14 bg-andes-paper/10" />
              <span className="cycle-card cycle-card-b absolute right-4 top-10 h-16 w-28 rounded-lg border border-andes-paper/14 bg-andes-paper/10" />
              <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-andes-crimson text-xs font-semibold text-andes-paper">
                {copy.productBadge}
              </span>
            </div>
          </MiniDemo>
        </div>
      </div>
      <style>{`
        .vault-product-cycle .cycle-card {
          animation: vault-card-cycle 5.8s var(--ease-andes) infinite both;
        }

        .vault-product-cycle .cycle-card-b {
          animation-delay: 0.7s;
        }

        @keyframes vault-card-cycle {
          0%, 100% {
            opacity: 0.38;
            transform: translate3d(0, 10px, 0) scale(0.98);
          }
          35%, 68% {
            opacity: 0.9;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vault-product-cycle .cycle-card {
            animation: none !important;
            opacity: 0.78;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

function MiniDemo({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <article className="min-h-44 rounded-lg border border-andes-paper/12 bg-andes-deep/72 p-4">
      <h3 className="font-display text-sm font-semibold text-andes-paper/72">{title}</h3>
      {children}
    </article>
  );
}

function TypeLiftLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduce = useReducedMotion();

  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        animate={{ y: 0 }}
        className="block"
        initial={reduce ? false : { y: "115%" }}
        transition={{ delay, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function FluidLabDemo({ copy }: { copy: DemoCopy["fluid"] }) {
  return (
    <div className="mx-auto mt-4 grid max-w-7xl overflow-hidden rounded-lg border border-andes-paper/14 bg-andes-paper/[0.04] lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
      <div className="vault-fluid-lab relative min-h-[360px] overflow-hidden border-b border-andes-paper/12 lg:border-b-0 lg:border-r">
        <span className="fluid-sheet fluid-sheet-a" />
        <span className="fluid-sheet fluid-sheet-b" />
        <span className="fluid-sheet fluid-sheet-c" />
        <span className="fluid-cursor" />
        <span className="fluid-grain" />
      </div>
      <div className="p-6 sm:p-8">
        <div className="inline-flex rounded-full border border-andes-crimson/35 px-3 py-1 text-xs font-semibold text-andes-crimson">
          {copy.status}
        </div>
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-andes-paper sm:text-4xl">{copy.title}</h2>
        <p className="mt-4 text-sm leading-6 text-andes-paper/62">{copy.description}</p>
        <div className="mt-7 grid gap-3">
          <FluidNote label={copy.cursor} />
          <FluidNote label={copy.fallback} />
          <FluidNote label={copy.note} />
        </div>
      </div>
      <style>{`
        .vault-fluid-lab {
          background:
            radial-gradient(circle at 18% 22%, color-mix(in oklab, var(--color-andes-crimson) 28%, transparent), transparent 32%),
            radial-gradient(circle at 82% 36%, rgba(250, 250, 247, 0.12), transparent 34%),
            var(--color-andes-deep);
        }

        .vault-fluid-lab .fluid-sheet {
          animation: vault-fluid-lab-flow 9s ease-in-out infinite;
          border-radius: 48% 52% 44% 56%;
          filter: blur(24px);
          mix-blend-mode: screen;
          opacity: 0.78;
          position: absolute;
        }

        .vault-fluid-lab .fluid-sheet-a {
          background: color-mix(in oklab, var(--color-andes-crimson) 62%, var(--color-andes-paper));
          height: 260px;
          left: 6%;
          top: 12%;
          width: 310px;
        }

        .vault-fluid-lab .fluid-sheet-b {
          animation-delay: -2.4s;
          background: rgba(250, 250, 247, 0.34);
          bottom: 2%;
          height: 230px;
          right: 12%;
          width: 280px;
        }

        .vault-fluid-lab .fluid-sheet-c {
          animation-delay: -4.8s;
          background: color-mix(in oklab, var(--color-andes-dawn) 28%, transparent);
          height: 220px;
          left: 36%;
          top: 34%;
          width: 240px;
        }

        .vault-fluid-lab .fluid-cursor {
          animation: vault-fluid-lab-cursor 5.6s var(--ease-andes) infinite;
          background: var(--color-andes-paper);
          border-radius: 999px;
          box-shadow: 0 0 0 12px rgba(250, 250, 247, 0.08), 0 0 42px rgba(250, 250, 247, 0.48);
          height: 10px;
          left: 50%;
          position: absolute;
          top: 50%;
          width: 10px;
        }

        .vault-fluid-lab .fluid-grain {
          background-image:
            radial-gradient(circle, rgba(250, 250, 247, 0.16) 1px, transparent 1px),
            radial-gradient(circle, rgba(250, 250, 247, 0.08) 1px, transparent 1px);
          background-position: 0 0, 18px 22px;
          background-size: 42px 42px;
          inset: 0;
          opacity: 0.3;
          position: absolute;
        }

        @keyframes vault-fluid-lab-flow {
          0%, 100% {
            border-radius: 42% 58% 48% 52%;
            transform: translate3d(0, 0, 0) rotate(-4deg) scale(1);
          }
          45% {
            border-radius: 62% 38% 56% 44%;
            transform: translate3d(36px, -22px, 0) rotate(7deg) scale(1.12);
          }
          72% {
            border-radius: 48% 52% 34% 66%;
            transform: translate3d(-18px, 24px, 0) rotate(-2deg) scale(0.94);
          }
        }

        @keyframes vault-fluid-lab-cursor {
          0%, 100% {
            transform: translate3d(-170px, -86px, 0);
          }
          38% {
            transform: translate3d(132px, -22px, 0);
          }
          68% {
            transform: translate3d(-18px, 96px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vault-fluid-lab .fluid-sheet,
          .vault-fluid-lab .fluid-cursor {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function FluidNote({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-andes-paper/12 bg-andes-deep/72 px-4 py-3 text-sm font-semibold leading-5 text-andes-paper/78">
      {label}
    </div>
  );
}
