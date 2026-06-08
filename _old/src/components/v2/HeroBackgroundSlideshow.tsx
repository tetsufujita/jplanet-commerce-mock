"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

export type SlideshowImage = {
  src: string;
  alt: string;
};

type Props = {
  images: SlideshowImage[];
  /** Time each image stays on screen including the crossfade (ms). */
  intervalMs?: number;
  /** Crossfade duration (ms). */
  fadeMs?: number;
};

/**
 * Fullbleed background slideshow with subtle Ken Burns zoom. Each layer is an
 * absolutely-positioned Image with object-cover; the active layer fades in
 * over the previous one. Two layers swap roles every interval so we never
 * unmount images mid-animation.
 */
export function HeroBackgroundSlideshow({
  fadeMs = 1400,
  images,
  intervalMs = 6000,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || images.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs, reducedMotion]);

  if (images.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {images.map((image, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            className="absolute inset-0"
            key={image.src}
            style={{
              opacity: isActive ? 1 : 0,
              transition: `opacity ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <div
              className="absolute inset-0 h-full w-full"
              style={{
                animation: reducedMotion
                  ? "none"
                  : `andes-kenburns-${index % 2} ${intervalMs + fadeMs}ms ease-in-out infinite alternate`,
                transformOrigin: index % 2 === 0 ? "50% 40%" : "60% 50%",
              }}
            >
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                priority={index === 0}
                sizes="100vw"
                src={image.src}
                unoptimized
              />
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes andes-kenburns-0 {
          from { transform: scale(1) translate3d(0,0,0); }
          to { transform: scale(1.09) translate3d(-1%,1%,0); }
        }
        @keyframes andes-kenburns-1 {
          from { transform: scale(1.04) translate3d(1%,-1%,0); }
          to { transform: scale(1.12) translate3d(-1%,2%,0); }
        }
      `}</style>
    </div>
  );
}
