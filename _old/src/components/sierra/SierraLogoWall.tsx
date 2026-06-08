"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

const EASE = [0.22, 1, 0.36, 1] as const;

const WORDMARKS: readonly string[] = [
  "Northwind",
  "Meridian",
  "Brightline",
  "Vantage",
  "Cedar Health",
  "Lumen",
  "Harbor Bank",
  "Quill",
  "Orbit",
  "Verde",
  "Foundry",
  "Atlas",
];

function Wordmark({ label }: { label: string }) {
  return (
    <span
      className="font-display whitespace-nowrap text-lg sm:text-xl tracking-[-0.01em]"
      style={{ color: "#9AA0A6" }}
    >
      {label}
    </span>
  );
}

function MarqueeTrack({
  items,
  animate,
}: {
  items: readonly string[];
  animate: boolean;
}) {
  // Two identical halves laid end to end; translating -50% then snapping back
  // creates a seamless continuous loop.
  const half = (keyPrefix: string) => (
    <div
      aria-hidden={keyPrefix === "b" ? true : undefined}
      className="flex shrink-0 items-center gap-x-14 sm:gap-x-20 pr-14 sm:pr-20"
    >
      {items.map((label, i) => (
        <Wordmark key={`${keyPrefix}-${i}`} label={label} />
      ))}
    </div>
  );

  return (
    <motion.div
      className="flex w-max items-center"
      animate={animate ? { x: ["0%", "-50%"] } : undefined}
      transition={
        animate
          ? { duration: 48, ease: "linear", repeat: Infinity }
          : undefined
      }
    >
      {half("a")}
      {half("b")}
    </motion.div>
  );
}

export function SierraLogoWall() {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <section className="py-24 sm:py-32" style={{ backgroundColor: SIERRA.paper }}>
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <motion.div
          initial={animate ? { opacity: 0, y: 18 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center"
        >
          <h2
            className="font-display tracking-[-0.03em]"
            style={{
              color: SIERRA.ink,
              fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
              lineHeight: 1.15,
            }}
          >
            Leading brands succeed with Sierra.
          </h2>

          <a
            href="#customer-stories"
            className="font-display inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm tracking-[-0.01em] transition-colors duration-200"
            style={{
              color: SIERRA.forest,
              borderColor: "rgba(0,104,56,0.28)",
            }}
          >
            Customer stories
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 6.5h6.5M6.75 3.75 9.5 6.5 6.75 9.25"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Full-bleed quiet marquee, recessed as ballast. */}
      <motion.div
        initial={animate ? { opacity: 0 } : false}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className="relative mt-16 sm:mt-20 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        }}
      >
        <MarqueeTrack items={WORDMARKS} animate={animate} />
      </motion.div>
    </section>
  );
}
