"use client";

import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { ScrollTrigger } from "@/lib/gsap";

type Props = {
  /** MP4 file path (served from /public/...). */
  src: string;
  /** Poster image while video loads. */
  poster?: string;
  /** Peak opacity of the video layer (0-1). */
  opacity?: number;
  /** Dark veil overlay alpha (0-1). */
  veil?: number;
};

export function VideoScrubLayer({ opacity = 0.85, poster, src, veil = 0.32 }: Props) {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const handleLoaded = () => {
      // Pause so scroll drives currentTime explicitly
      video.pause();
      setReady(true);
    };

    if (video.readyState >= 2 && video.duration > 0) {
      handleLoaded();
    } else {
      video.addEventListener("loadedmetadata", handleLoaded, { once: true });
    }

    // Some browsers refuse to seek if the video has never played, so we kick off
    // a muted autoplay then immediately pause.
    void video.play().catch(() => {
      /* autoplay denied is fine; we still scrub by currentTime. */
    });

    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [src]);

  useGSAP(
    () => {
      if (reducedMotion) {
        return;
      }

      const video = videoRef.current;

      if (!video || !ready) {
        return;
      }

      const state = { current: 0, target: 0 };
      let rafId = 0;

      const trigger = ScrollTrigger.create({
        end: () => `${document.documentElement.scrollHeight - window.innerHeight}px`,
        scrub: 0.4,
        start: 0,
        trigger: document.body,
        onUpdate: (self) => {
          if (!video.duration || Number.isNaN(video.duration)) {
            return;
          }
          state.target = self.progress * video.duration;
        },
      });

      const tick = () => {
        const duration = video.duration;

        if (duration && !Number.isNaN(duration)) {
          state.current += (state.target - state.current) * 0.18;

          if (Math.abs(video.currentTime - state.current) > 0.04) {
            try {
              video.currentTime = state.current;
            } catch {
              /* seek errors silently ignored */
            }
          }
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      const onResize = () => ScrollTrigger.refresh();

      window.addEventListener("resize", onResize);

      return () => {
        trigger.kill();
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
      };
    },
    { dependencies: [reducedMotion, ready, src], revertOnUpdate: true },
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        crossOrigin="anonymous"
        muted
        playsInline
        poster={poster}
        preload="auto"
        ref={videoRef}
        style={{
          // Light cinematic color grading on the placeholder footage so it feels
          // less flat. Real Brazil video later will look richer too.
          filter: "contrast(1.08) saturate(1.18) brightness(0.95)",
          transform: "scale(1.04)",
          transformOrigin: "center",
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Veil only at the very top + very bottom so text edges land on a darker zone */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,${veil * 0.85}) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,${veil}) 100%)`,
        }}
      />
    </div>
  );
}
