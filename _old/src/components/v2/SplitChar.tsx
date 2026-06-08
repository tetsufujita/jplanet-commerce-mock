"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { cx } from "@/lib/classnames";

type Props = {
  /** The plain string to split. */
  text: string;
  /** Stagger between characters in seconds. */
  stagger?: number;
  /** Initial delay before the first character begins (seconds). */
  delay?: number;
  /** Animation duration per character (seconds). */
  duration?: number;
  /** Easing for the translateY motion. */
  easing?: string;
  /** Optional className applied to the outer wrapper. */
  className?: string;
  /** If true, plays once on mount; otherwise waits for IntersectionObserver. */
  immediate?: boolean;
};

/**
 * Lusion-style letter mask split reveal.
 *
 * Each character is wrapped in a mask whose contents start translated 100%
 * below the baseline. The mask hides everything except the visible row; we
 * animate translateY 100% → 0 with a stagger per character. The result is
 * the "characters rising from a slit" reveal used across Lusion.
 */
export function SplitChar({
  className,
  delay = 0,
  duration = 0.8,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
  immediate = false,
  stagger = 0.03,
  text,
}: Props) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate || visible) return;
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.15 },
    );

    io.observe(node);

    return () => io.disconnect();
  }, [immediate, visible]);

  // Split into characters but keep whitespace as plain spaces so the line
  // wraps naturally.
  const chars = Array.from(text);

  return (
    <span
      aria-label={text}
      className={cx("inline-block whitespace-pre-wrap", className)}
      ref={ref}
    >
      {chars.map((ch, i) => {
        if (ch === " " || ch === " ") {
          return (
            <span aria-hidden className="inline-block" key={`sp-${i}`}>
              {ch}
            </span>
          );
        }

        const transitionDelay = reducedMotion ? "0s" : `${delay + stagger * i}s`;

        return (
          <span
            aria-hidden
            className="relative inline-block overflow-hidden align-baseline"
            key={`c-${i}`}
            style={{ lineHeight: "inherit" }}
          >
            <span
              className="inline-block will-change-transform"
              style={{
                transform: visible || reducedMotion ? "translate3d(0, 0%, 0)" : "translate3d(0, 105%, 0)",
                transition: reducedMotion
                  ? "none"
                  : `transform ${duration}s ${easing} ${transitionDelay}`,
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </span>
  );
}
