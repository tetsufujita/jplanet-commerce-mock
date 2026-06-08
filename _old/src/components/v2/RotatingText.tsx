"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

type Props = {
  /** Strings cycled in order, looping back to start. */
  items: string[];
  /** Milliseconds each item stays visible (default 2800). */
  intervalMs?: number;
  /** Cross-fade duration in ms (default 460). */
  fadeMs?: number;
  /** Tailwind / inline className for the wrapper (sets sizing context). */
  className?: string;
};

/**
 * Shopify-style rotating headline phrase. Cross-fades between strings with
 * a brief out → in transition. Reserves height for the longest item so the
 * surrounding layout does not jump on each swap.
 */
export function RotatingText({ className, fadeMs = 460, intervalMs = 2800, items }: Props) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reducedMotion || items.length <= 1) return;
    const cycle = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setVisible(true);
      }, fadeMs);
    }, intervalMs);
    return () => window.clearInterval(cycle);
  }, [fadeMs, intervalMs, items.length, reducedMotion]);

  return (
    <span className={className} style={{ display: "inline-grid" }}>
      {/* Sizer: invisible longest item reserves the box so siblings don't jump */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {items.reduce((longest, current) => (current.length > longest.length ? current : longest), items[0] ?? "")}
      </span>
      {/* Live rotating layer */}
      <span
        aria-live="polite"
        className="col-start-1 row-start-1 transition-[opacity,transform] ease-andes"
        style={{
          opacity: visible || reducedMotion ? 1 : 0,
          transform: visible || reducedMotion ? "translate3d(0,0,0)" : "translate3d(0,-12px,0)",
          transitionDuration: `${fadeMs}ms`,
        }}
      >
        {items[index]}
      </span>
    </span>
  );
}
