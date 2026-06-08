"use client";

import { type ReactNode } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { cx } from "@/lib/classnames";

type Props = {
  items: ReactNode[];
  /** Animation duration in seconds for one full loop. Lower = faster. */
  duration?: number;
  /** Optional className applied to the outer wrapper. */
  className?: string;
};

/**
 * Infinite horizontal scroll for trust / partner logos.
 *
 * Renders the supplied items twice back-to-back, then animates the inner
 * track by 50% (the width of one set). Because the two sets are identical,
 * the loop is seamless without JS.
 */
export function LogoMarquee({ className, duration = 40, items }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cx("relative w-full overflow-hidden", className)} aria-hidden>
      <div
        className="flex w-max items-center gap-16"
        style={{
          animation: reducedMotion ? "none" : `andes-marquee ${duration}s linear infinite`,
        }}
      >
        {items.map((item, index) => (
          <div className="shrink-0 opacity-70" key={`a-${index}`}>
            {item}
          </div>
        ))}
        {items.map((item, index) => (
          <div className="shrink-0 opacity-70" key={`b-${index}`}>
            {item}
          </div>
        ))}
      </div>
      <style>{`@keyframes andes-marquee { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }`}</style>
    </div>
  );
}
