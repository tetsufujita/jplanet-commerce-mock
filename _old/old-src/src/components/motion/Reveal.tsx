"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** seconds */
  duration?: number;
};

/**
 * Scroll-into-view reveal (fade + rise). Replaces mount-fired CSS animations so
 * motion is choreographed to the scroll position, not the page load.
 * Honors prefers-reduced-motion (renders static).
 */
export function Reveal({ children, className, delay = 0, y = 24, duration = 0.7 }: RevealProps) {
  const reduce = useReducedMotion();
  const [renderStatic, setRenderStatic] = useState(false);

  useEffect(() => {
    if (reduce) setRenderStatic(true);
  }, [reduce]);

  if (renderStatic) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
