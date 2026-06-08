"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

const EASE = [0.22, 1, 0.36, 1] as const;

type TableRow = {
  channel: string;
  resolved: string;
  csat: string;
};

const TABLE_ROWS: readonly TableRow[] = [
  { channel: "Account & billing", resolved: "12,904", csat: "96%" },
  { channel: "Order tracking", resolved: "31,576", csat: "94%" },
  { channel: "Returns & refunds", resolved: "9,118", csat: "92%" },
  { channel: "Technical support", resolved: "6,402", csat: "90%" },
];

// Smooth hand-built area chart path (single-pass, premium curve).
const AREA_PATH =
  "M0 78 C 40 70, 70 52, 110 56 C 150 60, 180 34, 220 30 C 260 26, 290 44, 330 38 C 370 32, 400 18, 440 22 L 440 110 L 0 110 Z";
const LINE_PATH =
  "M0 78 C 40 70, 70 52, 110 56 C 150 60, 180 34, 220 30 C 260 26, 290 44, 330 38 C 370 32, 400 18, 440 22";

function AskPill() {
  return (
    <div
      className="flex items-center gap-2 rounded-full border bg-white/80 px-3.5 py-1.5"
      style={{ borderColor: "rgba(48,46,45,0.12)" }}
    >
      <span
        className="grid h-4 w-4 place-items-center rounded-full"
        style={{ backgroundColor: SIERRA.forest }}
        aria-hidden
      >
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
          <path
            d="M2 6 L10 6 M6 2 L6 10"
            stroke={SIERRA.paper}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className="font-display text-[12px]"
        style={{ color: "rgba(48,46,45,0.45)" }}
      >
        Ask the agent anything…
      </span>
    </div>
  );
}

function DashboardMock() {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl bg-white ring-1"
      style={{
        boxShadow: "0 40px 90px -30px rgba(30,46,80,0.35)",
        // ring color via boxShadow ring proxy
      }}
    >
      <div className="ring-1 ring-[rgba(48,46,45,0.08)] rounded-2xl">
        {/* Header row */}
        <div
          className="flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-7"
          style={{ borderColor: "rgba(48,46,45,0.08)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-6 w-6 place-items-center rounded-md"
              style={{ backgroundColor: SIERRA.offwhite }}
              aria-hidden
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                <path
                  d="M8 1.5 L14 5 L8 8.5 L2 5 Z M2 11 L8 14.5 L14 11"
                  fill="none"
                  stroke={SIERRA.forest}
                  strokeWidth={1.3}
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className="font-display text-[14px] font-medium"
              style={{ color: SIERRA.ink }}
            >
              Resolution overview
            </span>
          </div>
          <AskPill />
        </div>

        {/* Chart block */}
        <div className="px-5 pt-5 sm:px-7">
          <div className="flex items-end justify-between">
            <div>
              <p
                className="font-display text-[11px] uppercase tracking-[0.14em]"
                style={{ color: "rgba(48,46,45,0.40)" }}
              >
                Conversations resolved
              </p>
              <p
                className="font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
                style={{ color: SIERRA.ink }}
              >
                88,412
              </p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 font-display text-[11px] font-medium"
              style={{
                color: SIERRA.forest,
                backgroundColor: "rgba(0,104,56,0.08)",
              }}
            >
              +14.2% this month
            </span>
          </div>

          <svg
            viewBox="0 0 440 110"
            preserveAspectRatio="none"
            className="mt-4 h-28 w-full sm:h-32"
            aria-hidden
          >
            <defs>
              <linearGradient id="agentos-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SIERRA.leaf} stopOpacity={0.22} />
                <stop offset="100%" stopColor={SIERRA.leaf} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={AREA_PATH} fill="url(#agentos-area)" />
            <path
              d={LINE_PATH}
              fill="none"
              stroke={SIERRA.forest}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle cx={440} cy={22} r={3.5} fill={SIERRA.forest} />
            <circle cx={440} cy={22} r={6.5} fill={SIERRA.forest} fillOpacity={0.16} />
          </svg>
        </div>

        {/* Data table */}
        <div className="px-5 pb-6 pt-3 sm:px-7">
          <div
            className="grid grid-cols-[1.6fr_1fr_0.8fr] gap-3 border-b pb-2 font-display text-[11px] uppercase tracking-[0.12em]"
            style={{
              color: "rgba(48,46,45,0.40)",
              borderColor: "rgba(48,46,45,0.08)",
            }}
          >
            <span>Topic</span>
            <span className="text-right">Resolved</span>
            <span className="text-right">CSAT</span>
          </div>
          {TABLE_ROWS.map((row) => (
            <div
              key={row.channel}
              className="grid grid-cols-[1.6fr_1fr_0.8fr] items-center gap-3 border-b py-2.5 font-display text-[13px] last:border-b-0"
              style={{
                color: SIERRA.ink,
                borderColor: "rgba(48,46,45,0.05)",
              }}
            >
              <span className="truncate">{row.channel}</span>
              <span className="text-right tabular-nums" style={{ color: "rgba(48,46,45,0.70)" }}>
                {row.resolved}
              </span>
              <span className="text-right font-medium" style={{ color: SIERRA.forest }}>
                {row.csat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SierraAgentOS() {
  const reduce = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sheetRef,
    offset: ["start end", "end start"],
  });

  // Subtle scroll parallax for the dashboard. Disabled under reduced motion.
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sheetRef}
      className="relative overflow-hidden rounded-t-[40px]"
      style={{
        background: "linear-gradient(180deg, #EEF3FB 0%, #F7FAFE 42%, #FFFFFF 100%)",
      }}
    >
      {/* Faint blueprint dot-grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(48,72,120,0.10) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(120% 80% at 50% 30%, #000 0%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 30%, #000 0%, #000 55%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-6 py-24 sm:py-32 lg:px-10">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <span
            className="font-display text-[12px] font-medium uppercase tracking-[0.18em]"
            style={{ color: SIERRA.forest }}
          >
            The platform
          </span>
          <h2
            className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
            style={{ color: SIERRA.ink }}
          >
            Sierra Agent OS
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl font-display text-base leading-relaxed sm:text-lg"
            style={{ color: "rgba(48,46,45,0.62)" }}
          >
            One operating layer for every conversational agent — observe,
            measure, and improve outcomes from a single, calm surface.
          </p>
        </motion.div>

        {/* Floating dashboard */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          {/* Outer: scroll-driven parallax (MotionValue). Inner: gentle float bob. */}
          <motion.div style={reduce ? undefined : { y: parallaxY }}>
            <motion.div
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: 6, ease: "easeInOut", repeat: Infinity }
              }
            >
              <DashboardMock />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
