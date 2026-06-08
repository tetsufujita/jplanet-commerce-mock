"use client";

import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, type ComponentPropsWithoutRef } from "react";

import type { Locale } from "@/i18n/routing";
import { cx } from "@/lib/classnames";

type NumberTickerProps = ComponentPropsWithoutRef<"span"> & {
  value: number;
  locale: Locale;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
};

export function NumberTicker({
  value,
  locale,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { margin: "0px", once: true });
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces,
      }),
    [decimalPlaces, locale],
  );

  useEffect(() => {
    if (!isInView) return undefined;

    const finalValue = direction === "down" ? startValue : value;
    if (reduce) {
      motionValue.set(finalValue);
      return undefined;
    }

    const timer = setTimeout(() => {
      motionValue.set(finalValue);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, direction, isInView, motionValue, reduce, startValue, value]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (!ref.current) return;

        ref.current.textContent = formatter.format(Number(latest.toFixed(decimalPlaces)));
      }),
    [decimalPlaces, formatter, springValue],
  );

  return (
    <span className={cx("inline-block tabular-nums", className)} ref={ref} {...props}>
      {formatter.format(startValue)}
    </span>
  );
}
