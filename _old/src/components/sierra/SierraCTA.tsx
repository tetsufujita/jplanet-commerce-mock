"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SierraCTA() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.8, ease: EASE },
    },
  };

  return (
    <section
      className="font-display"
      style={{ backgroundColor: SIERRA.offwhite }}
    >
      <div className="mx-auto max-w-[1240px] px-6 py-32 sm:py-40 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mx-auto flex max-w-[760px] flex-col items-center text-center"
        >
          {/* Small forest mark — the accent appears restrained, twice */}
          <motion.span
            variants={item}
            className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.18em]"
            style={{ color: SIERRA.forest }}
          >
            <LeafMark />
            Get started
          </motion.span>

          <motion.h2
            variants={item}
            className="text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4rem]"
            style={{ color: SIERRA.ink }}
          >
            Discover what Sierra can do for you.
          </motion.h2>

          <motion.p
            variants={item}
            className="mt-6 max-w-[520px] text-[1.0625rem] leading-[1.6] sm:text-[1.1875rem]"
            style={{ color: "rgba(48,46,45,0.62)" }}
          >
            Build a conversational agent that speaks for your brand — always on,
            always learning, always exceptional.
          </motion.p>

          <motion.div variants={item} className="mt-12">
            <PillButton reduce={!!reduce} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PillButton({ reduce }: { reduce: boolean }) {
  return (
    <motion.a
      href="#learn-more"
      className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium tracking-[-0.01em]"
      style={{ backgroundColor: SIERRA.forest, color: SIERRA.paper }}
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { y: 0, scale: 0.985 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <span>Learn more</span>
      <motion.span
        aria-hidden
        className="inline-flex"
        initial={false}
        whileHover={reduce ? undefined : { x: 3 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Arrow />
      </motion.span>
    </motion.a>
  );
}

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h9" />
      <path d="M8.5 4.5 12 8l-3.5 3.5" />
    </svg>
  );
}

function LeafMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13 3C7 3 3 6.5 3 11c0 1 .3 2 .3 2s4-9 9.7-10Z" />
      <path d="M3.3 13C6 9 9 7 12.5 5.5" />
    </svg>
  );
}
