"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { lerpColor } from "@/components/cinematic/color";
import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Stop = {
  /** CSS selector. The first matching element decides this stop's anchor position. */
  selector: string;
  /** Anchor position within the matched element (0=top, 1=bottom). */
  anchor?: number;
  /** Solid color this stop should arrive at. */
  color: string;
};

type BackgroundFlowClaudeProps = {
  /** Stops listed in vertical order. Bg color lerps from one stop to the next as scroll progresses. */
  stops: Stop[];
};

export function BackgroundFlowClaude({ stops }: BackgroundFlowClaudeProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const layer = layerRef.current;

      if (!layer || stops.length === 0) {
        return;
      }

      type ResolvedStop = { anchor: number; color: string; element: HTMLElement; selector: string };

      const resolved: ResolvedStop[] = stops
        .map((stop): ResolvedStop | null => {
          const element = document.querySelector<HTMLElement>(stop.selector);

          return element ? { anchor: stop.anchor ?? 0.5, color: stop.color, element, selector: stop.selector } : null;
        })
        .filter((stop): stop is ResolvedStop => stop !== null);

      const first = resolved[0];
      const last = resolved[resolved.length - 1];

      if (!first || !last) {
        return;
      }

      gsap.set(layer, { backgroundColor: first.color });

      if (reducedMotion) {
        gsap.set(layer, { backgroundColor: last.color });

        return;
      }

      const getAnchorScrollY = (entry: { anchor: number; element: HTMLElement }) => {
        const rect = entry.element.getBoundingClientRect();
        const top = window.scrollY + rect.top;

        return top + entry.element.offsetHeight * entry.anchor - window.innerHeight / 2;
      };

      const triggers: ScrollTrigger[] = [];

      for (let i = 0; i < resolved.length - 1; i += 1) {
        const from = resolved[i];
        const to = resolved[i + 1];

        if (!from || !to) {
          continue;
        }

        const startY = getAnchorScrollY(from);
        const endY = getAnchorScrollY(to);

        if (endY <= startY) {
          continue;
        }

        const fromColor = from.color;
        const toColor = to.color;
        const trigger = ScrollTrigger.create({
          end: endY,
          scrub: 0.6,
          start: startY,
          onUpdate: (self) => {
            gsap.set(layer, {
              backgroundColor: lerpColor(fromColor, toColor, self.progress),
            });
          },
        });

        triggers.push(trigger);
      }

      const refresh = () => ScrollTrigger.refresh();

      window.addEventListener("resize", refresh);

      return () => {
        window.removeEventListener("resize", refresh);
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    {
      dependencies: [reducedMotion, stops.map((stop) => `${stop.selector}:${stop.color}`).join("|")],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      ref={layerRef}
      style={{ backgroundColor: stops[0]?.color ?? "#060B1F" }}
    />
  );
}
