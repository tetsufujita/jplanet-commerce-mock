"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import type { Locale } from "@/i18n/routing";

const NAVY = "#0A1428";
const MINT = "#7AE0B5";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS: { value: string; label: string }[] = [
  { value: "6.6億人", label: "ラテンアメリカの人口" },
  { value: "US$7,690億", label: "ラテンアメリカ EC 市場" },
  { value: "2.1億人", label: "ブラジルの人口" },
];

export function HeroV5({ locale }: { locale: Locale }) {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay } }
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE, delay } };

  return (
    <section
      aria-label="Andes — 中南米に新しい経済の基盤を建てる"
      className="relative isolate w-full overflow-hidden text-white"
      style={{ minHeight: "100svh", background: NAVY }}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(180deg, #0A1428 0%, #0B1126 100%)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(1200px 760px at 50% 18%, black, transparent 82%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(1000px 560px at 50% -6%, rgba(122,224,181,0.10), transparent 60%)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col justify-center px-6 py-24 sm:px-10 lg:px-16">
        <motion.span
          {...rise(0)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.24em] text-white/80"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: MINT }} />
          ラテンアメリカ × 日本
        </motion.span>

        <motion.h1
          {...rise(0.12)}
          className="mt-8 font-display font-bold tracking-[-0.045em] text-white"
          style={{ fontSize: "clamp(2.7rem, 6.6vw, 6.2rem)", lineHeight: 1.02 }}
        >
          中南米に、新しい
          <br />
          経済の基盤を
          <span style={{ color: MINT }}>建てる。</span>
        </motion.h1>

        <motion.p
          {...rise(0.24)}
          className="mt-7 max-w-[46ch] font-jp text-white/75"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.2rem)", lineHeight: 1.7 }}
        >
          日本と韓国のブランドが、ラテンアメリカ 6.6億人へ届く。会話の裏で物流・決済・税務・通関を引き受ける、
          Agentic Commerce プラットフォーム。
        </motion.p>

        {/* numbers backing — the proof the ambition isn't bluster */}
        <motion.div
          {...rise(0.36)}
          className="mt-12 grid max-w-[760px] grid-cols-1 gap-px overflow-hidden rounded-[18px] border border-white/10 sm:grid-cols-3"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 bg-[#0A1428] px-6 py-6">
              <span
                className="font-display font-bold tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontVariantNumeric: "tabular-nums" }}
              >
                {s.value}
              </span>
              <span className="font-jp text-[12.5px] leading-snug text-white/55">{s.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div {...rise(0.48)} className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-display text-[14px] font-semibold tracking-[-0.01em] text-[#0A1428] transition duration-300 hover:-translate-y-0.5 hover:bg-[#F3F5F8] active:scale-[0.98]"
            href={`/${locale}/contact`}
          >
            販売を開始する
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-7 py-3.5 font-display text-[14px] font-semibold text-white transition duration-300 hover:border-white/45 hover:bg-white/[0.08]"
            href={`/${locale}/about`}
          >
            Andes について
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
