import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/** IntersectionObserver once — 進入で true になり戻らない（reveal 用） */
export function useRevealInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => { io.disconnect(); };
  }, [threshold]);

  return { ref, inView };
}

/** interval 巡回。in-view 外と reduced-motion で停止。reset() で手動操作後の再スタート。 */
export function useAutoCycle<T extends HTMLElement>(length: number, intervalMs: number) {
  const ref = useRef<T | null>(null);
  const [index, setIndex] = useState(0);
  const [generation, setGeneration] = useState(0);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => { setActive(entries.some((e) => e.isIntersecting)); }, {
      threshold: 0.3,
    });
    io.observe(el);
    return () => { io.disconnect(); };
  }, []);

  useEffect(() => {
    if (reduced || !active || length <= 1) return;
    const t = setInterval(() => { setIndex((i) => (i + 1) % length); }, intervalMs);
    return () => { clearInterval(t); };
  }, [reduced, active, length, intervalMs, generation]);

  const select = (i: number) => {
    setIndex(i);
    setGeneration((g) => g + 1);
  };

  return { ref, index, select };
}

export interface TimelineStage {
  key: string;
  ms: number;
}

/**
 * 可変長 stage の timeline 巡回（§3 chat デモ等の storyboard 駆動用）。
 * setTimeout chain で stage key を順に返し、末尾で先頭へループ。
 * in-view 外と reduced-motion で停止（停止中は最後の stage を保持）。
 * ⚠ stages は module-level const を渡すこと（毎 render 生成すると timer が再起動する）。
 */
export function useStageTimeline<T extends HTMLElement>(stages: readonly TimelineStage[]) {
  const ref = useRef<T | null>(null);
  const [stageKey, setStageKey] = useState(stages[0]?.key ?? "");
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setActive(entries.some((e) => e.isIntersecting));
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced || !active || stages.length === 0) return;
    let i = 0;
    let t: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const s = stages[i % stages.length];
      if (!s) return;
      setStageKey(s.key);
      t = setTimeout(() => {
        i += 1;
        tick();
      }, s.ms);
    };
    tick();
    return () => {
      clearTimeout(t);
    };
  }, [reduced, active, stages]);

  return { ref, stageKey, running: active && !reduced };
}
