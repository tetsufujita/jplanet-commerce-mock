"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { AgenticChatComposition } from "@/remotion/AgenticChatComposition";

const DURATION_FRAMES = 540;
const FPS = 30;
const FRAME_MS = 1000 / FPS;

/**
 * Live React animation rendered with Remotion's pure interpolate/spring
 * helpers. We drive the frame counter ourselves via requestAnimationFrame
 * so the composition advances reliably (we hit Player autoplay quirks).
 */
export function AgenticChatPlayer() {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setFrame(220); // Pick a still-looking mid-frame for reduced-motion users.
      return;
    }
    const tick = (t: number) => {
      if (startTimeRef.current === null) startTimeRef.current = t;
      const elapsed = t - startTimeRef.current;
      const next = Math.floor(elapsed / FRAME_MS) % DURATION_FRAMES;
      setFrame(next);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10">
      <AgenticChatComposition frame={frame} />
    </div>
  );
}
