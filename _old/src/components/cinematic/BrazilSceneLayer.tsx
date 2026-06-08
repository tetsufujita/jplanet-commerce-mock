"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type BrazilScene = {
  /** CSS selector targeting the chapter section. */
  selector: string;
  /** Image src (Unsplash CDN, free for commercial use). */
  src: string;
  /** Alt text. */
  alt: string;
  /** Anchor within the chapter (0=top, 1=bottom). */
  anchor?: number;
  /** Opacity peak when the chapter is centered (0-1). */
  peak?: number;
  /** Object-fit position (e.g., "center", "top", "50% 30%"). */
  position?: string;
};

type Props = {
  scenes: BrazilScene[];
};

export function BrazilSceneLayer({ scenes }: Props) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useGSAP(
    () => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const triggers: ScrollTrigger[] = [];

      scenes.forEach((scene, index) => {
        const layer = layerRefs.current[index];
        const target = document.querySelector<HTMLElement>(scene.selector);

        if (!layer || !target) {
          return;
        }

        const peak = scene.peak ?? 0.45;
        const anchor = scene.anchor ?? 0.5;

        // Initial state: first chapter visible, others hidden
        gsap.set(layer, { opacity: index === 0 ? peak : 0, scale: 1.02 });

        if (reducedMotion) {
          gsap.set(layer, { opacity: index === 0 ? peak : 0 });
          return;
        }

        // ScrollTrigger that drives opacity smoothly based on distance from anchor.
        // Range is wide so the image holds presence across the full chapter and
        // overlaps softly with adjacent chapters (cross-fade boundary).
        const trigger = ScrollTrigger.create({
          end: "bottom top",
          scrub: 0.5,
          start: "top bottom",
          trigger: target,
          onUpdate: (self) => {
            const rect = target.getBoundingClientRect();
            const elementCenter = rect.top + rect.height * anchor;
            const viewportCenter = window.innerHeight / 2;
            const offset = Math.abs(elementCenter - viewportCenter);
            // Wider visibility window (1.6× viewport) so adjacent chapters cross-fade.
            const maxOffset = window.innerHeight * 1.6;
            const closeness = 1 - Math.min(1, offset / maxOffset);

            // Plateau curve: stays near peak for a wide range, then smoothly falls.
            // Inspired by a flat-topped raised-cosine.
            const plateau = 0.55; // share of the range that stays at full peak
            let weight: number;
            if (closeness >= plateau) {
              weight = 1;
            } else {
              const t = closeness / plateau;
              // Smoothstep for the ramp-up portion
              weight = t * t * (3 - 2 * t);
            }

            gsap.set(layer, {
              opacity: peak * weight,
              scale: 1.02 + (1 - closeness) * 0.025,
            });

            // Slow parallax: scroll progress drives Y offset within the image
            const parallaxY = (self.progress - 0.5) * 60;
            gsap.set(layer, { y: parallaxY });
          },
        });

        triggers.push(trigger);
      });

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    {
      dependencies: [reducedMotion, scenes.map((s) => s.selector).join("|")],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      ref={containerRef}
    >
      {scenes.map((scene, index) => (
        <div
          className="absolute inset-0 mix-blend-screen will-change-transform"
          key={`${scene.selector}-${index}`}
          ref={(node) => {
            layerRefs.current[index] = node;
          }}
          style={{
            // Top + bottom soft mask so each image fades into the surrounding
            // shader bg at the edges. Makes section boundaries seamless.
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 18%, #000 35%, #000 65%, rgba(0,0,0,0.7) 82%, transparent 100%)",
            maskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 18%, #000 35%, #000 65%, rgba(0,0,0,0.7) 82%, transparent 100%)",
          }}
        >
          <Image
            alt={scene.alt}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="100vw"
            src={scene.src}
            style={{ objectPosition: scene.position ?? "center" }}
            unoptimized
          />
          {/* Dark veil over image so chapter copy remains readable */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}
    </div>
  );
}
