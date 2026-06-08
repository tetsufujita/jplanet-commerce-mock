"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

type Props = {
  /** Ordered MP4 sources cycled in a loop. */
  sources: string[];
  /** Optional poster image shown until the first video begins. */
  poster?: string;
  /** Crossfade duration in ms (default 450). */
  fadeMs?: number;
  /** How long each clip stays visible before crossfading (default 1500). */
  intervalMs?: number;
};

/**
 * Multi-clip background video loop. Renders two stacked <video> elements: one
 * plays the current clip, the second preloads the next clip. When the active
 * clip ends (or a per-clip max timer elapses) we crossfade and swap roles.
 * Only two clips are decoded at any moment, keeping bandwidth bounded even
 * with a 10-clip source list.
 */
export function HeroBackgroundVideoLoop({
  fadeMs = 800,
  intervalMs = 1500,
  poster,
  sources,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const [layerSrcs, setLayerSrcs] = useState<[string, string]>(() => [
    sources[0] ?? "",
    sources[1] ?? sources[0] ?? "",
  ]);
  const nextSourceIndex = useRef(2 % Math.max(sources.length, 1));
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);

  // Fixed-interval cycle: every intervalMs we crossfade to the inactive layer
  // and queue the next source into the layer that just faded out.
  useEffect(() => {
    if (reducedMotion || sources.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveLayer((current) => {
        const inactive = (current === 0 ? 1 : 0) as 0 | 1;
        window.setTimeout(() => {
          const future = sources[nextSourceIndex.current] ?? sources[0] ?? "";
          setLayerSrcs((prev) => {
            const updated: [string, string] = [...prev] as [string, string];
            updated[current] = future;
            return updated;
          });
          nextSourceIndex.current = (nextSourceIndex.current + 1) % sources.length;
        }, fadeMs);
        return inactive;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [fadeMs, intervalMs, reducedMotion, sources]);

  if (sources.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {([0, 1] as const).map((layer) => {
        const isActive = layer === activeLayer;
        return (
          <video
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            key={layer}
            loop={false}
            muted
            playsInline
            poster={layer === 0 ? poster : undefined}
            preload="auto"
            ref={(el) => {
              videoRefs.current[layer] = el;
              if (el && isActive) {
                el.play().catch(() => {
                  /* Autoplay was blocked — overlay still shows poster. */
                });
              }
            }}
            src={layerSrcs[layer]}
            style={{
              opacity: isActive ? 1 : 0,
              transition: `opacity ${fadeMs}ms linear`,
            }}
          />
        );
      })}
    </div>
  );
}
