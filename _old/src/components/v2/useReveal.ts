"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

type Options = {
  /** Threshold passed to IntersectionObserver. */
  threshold?: number;
  /** Root margin string. Negative bottom delays the trigger. */
  rootMargin?: string;
  /** If true, only triggers once. */
  once?: boolean;
};

/**
 * IntersectionObserver-backed reveal hook. Returns `[ref, visible]` — attach
 * the ref to the target element and use `visible` to drive your transition.
 */
export function useReveal<T extends HTMLElement>(options: Options = {}) {
  const { once = true, rootMargin = "0px 0px -10%", threshold = 0.15 } = options;
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) {
              io.disconnect();
              break;
            }
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { rootMargin, threshold },
    );

    io.observe(node);

    return () => io.disconnect();
  }, [once, reducedMotion, rootMargin, threshold]);

  return [ref, visible] as const;
}

/**
 * Generates a transition style object for a fade-up reveal driven by `useReveal`.
 */
export function fadeUpStyle(visible: boolean, delay = 0, reducedMotion = false) {
  if (reducedMotion) {
    return { opacity: 1, transform: "none" };
  }

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 24px, 0)",
    transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  };
}
