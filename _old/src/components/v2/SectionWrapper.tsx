"use client";

import { type ReactNode } from "react";

import { cx } from "@/lib/classnames";

type Props = {
  children: ReactNode;
  /** Optional id for in-page anchor. */
  id?: string;
  /** Optional className for the outer <section>. */
  className?: string;
  /** Optional className for the inner container. */
  innerClassName?: string;
  /** Optional aria-label. */
  label?: string;
  /** Vertical padding rhythm — large is Shopify-default 128, medium 96, small 64. */
  rhythm?: "large" | "medium" | "small";
};

/**
 * Transparent section wrapper used across v2. Provides consistent rhythm
 * and max-width without painting its own background — the page's single
 * navy bg shows through so boundaries blend seamlessly.
 */
export function SectionWrapper({
  children,
  className,
  id,
  innerClassName,
  label,
  rhythm = "large",
}: Props) {
  const padY =
    rhythm === "large"
      ? "py-24 sm:py-28 lg:py-32"
      : rhythm === "medium"
      ? "py-20 sm:py-24"
      : "py-14 sm:py-16";

  return (
    <section
      aria-label={label}
      className={cx("relative isolate w-full", padY, className)}
      id={id}
    >
      <div
        className={cx(
          "relative mx-auto w-full max-w-[1425px] px-6 sm:px-10 lg:px-16",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
