"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Counts a numeric value up from 0 when scrolled into view, preserving any
 * prefix (US$) and suffix (億人 / M / B) baked into the i18n string.
 * value examples: "6.6億人", "US$7,690億", "660M", "US$769B".
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  const match = value.match(/^(\D*)([\d.,]+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? value;
  const suffix = match?.[3] ?? "";
  const target = Number.parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
  const hasComma = numStr.includes(",");

  const format = (n: number): string => {
    if (hasComma) {
      return n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return n.toFixed(decimals);
  };

  const [display, setDisplay] = useState(() => (Number.isNaN(target) ? numStr : format(0)));

  useEffect(() => {
    if (reduce || Number.isNaN(target)) {
      setDisplay(numStr);
      return;
    }
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, target]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
