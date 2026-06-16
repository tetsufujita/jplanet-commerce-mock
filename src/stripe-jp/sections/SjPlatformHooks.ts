import { useEffect, useState } from "react";

/** prefers-reduced-motion を監視（常時アニメの interval 停止に使用） */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);
  return reduced;
}

/** n 個の state を ms 間隔で巡回（locale デモ / issuing 柄 / connect merchant 用） */
export function useCycle(length: number, intervalMs: number, running = true): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, intervalMs);
    return () => {
      window.clearInterval(id);
    };
  }, [length, intervalMs, running]);
  return index;
}
