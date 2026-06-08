"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

type MarkKind = "shield" | "check" | "lock" | "globe" | "star";

type Medallion = {
  label: string;
  mark: MarkKind;
};

const MEDALLIONS: readonly Medallion[] = [
  { label: "SOC 2", mark: "shield" },
  { label: "ISO 27001", mark: "lock" },
  { label: "ISO 42001", mark: "check" },
  { label: "HIPAA", mark: "shield" },
  { label: "GDPR", mark: "globe" },
  { label: "EU AI Act", mark: "check" },
  { label: "STAR", mark: "star" },
] as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function MarkGlyph({ kind }: { kind: MarkKind }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: SIERRA.forest,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />
          <path d="M9 12l2.2 2.2L15.5 10" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 12.2l2.4 2.4 4.6-5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="9" rx="2" />
          <path d="M8 10.5V8a4 4 0 018 0v2.5" />
          <path d="M12 14v2.4" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 4l2.3 4.9 5.2.7-3.8 3.7.9 5.3L12 16.9 7.4 18.6l.9-5.3L4.5 9.6l5.2-.7L12 4z" />
        </svg>
      );
  }
}

export function SierraCompliance() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.07,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.6, ease: EASE },
    },
  };

  const headHidden = { opacity: 0, y: reduce ? 0 : 12 };
  const headShow = { opacity: 1, y: 0 };

  return (
    <section
      className="font-display"
      style={{ backgroundColor: SIERRA.offwhite, color: SIERRA.ink }}
    >
      <div className="mx-auto max-w-[1240px] px-6 py-24 sm:py-32 lg:px-10">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
        >
          <motion.p
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: SIERRA.forest }}
            variants={{ hidden: headHidden, show: headShow }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
          >
            Trust &amp; reliability
          </motion.p>

          <motion.h2
            className="mt-5 text-balance text-3xl tracking-[-0.03em] sm:text-4xl md:text-[2.75rem] md:leading-[1.08]"
            variants={{ hidden: headHidden, show: headShow }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.05 }}
          >
            Built to the standards your security team expects.
          </motion.h2>

          <motion.p
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: "rgba(48,46,45,0.66)" }}
            variants={{ hidden: headHidden, show: headShow }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.1 }}
          >
            Independently audited and continuously monitored, so trust is never
            something you have to take on faith.
          </motion.p>
        </motion.div>

        <motion.ul
          className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:mt-16 sm:gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={container}
        >
          {MEDALLIONS.map((m) => (
            <motion.li
              key={m.label}
              variants={item}
              className="flex items-center gap-2.5 rounded-full px-4 py-2.5"
              style={{
                backgroundColor: SIERRA.paper,
                border: "1px solid rgba(48,46,45,0.10)",
                boxShadow:
                  "0 1px 2px rgba(48,46,45,0.04), 0 8px 20px rgba(48,46,45,0.05)",
              }}
              whileHover={
                reduce
                  ? undefined
                  : { y: -2, transition: { duration: 0.25, ease: EASE } }
              }
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor: SIERRA.offwhite,
                  border: "1px solid rgba(0,104,56,0.16)",
                }}
              >
                <MarkGlyph kind={m.mark} />
              </span>
              <span className="text-sm font-medium tracking-[-0.01em]">
                {m.label}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
