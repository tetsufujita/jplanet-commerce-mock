import { useEffect, useState } from "react";

export interface UseSazoHeroOptions {
  intervalMs: number;
  onNext: () => void;
  paused: boolean;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function readsReducedMotionPreference() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(reducedMotionQuery).matches
    : false;
}

export function useSazoHero({ intervalMs, onNext, paused }: UseSazoHeroOptions) {
  const [reducedMotion, setReducedMotion] = useState(readsReducedMotionPreference);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const updatePreference = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || intervalMs <= 0) {
      return undefined;
    }

    const interval = window.setInterval(onNext, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [intervalMs, onNext, paused, reducedMotion]);
}
