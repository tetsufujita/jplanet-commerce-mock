"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";

const TRAIL_LENGTH = 18;
const DOT_RADIUS = 8;
const FADE_DURATION = 0.55;

type TrailPoint = {
  age: number;
  x: number;
  y: number;
};

export function CursorTrailClaude() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    let raf = 0;
    let lastTime = performance.now();
    const trail: TrailPoint[] = [];
    let pointer: { x: number; y: number } | null = null;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      trail.push({ age: 0, x: event.clientX, y: event.clientY });

      if (trail.length > TRAIL_LENGTH) {
        trail.shift();
      }
    };

    const onPointerLeave = () => {
      pointer = null;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);

      lastTime = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Age trail points
      for (let i = trail.length - 1; i >= 0; i -= 1) {
        const point = trail[i];

        if (!point) {
          continue;
        }

        point.age += dt;

        if (point.age >= FADE_DURATION) {
          trail.splice(i, 1);
        }
      }

      // Draw trail
      ctx.globalCompositeOperation = "lighter";

      trail.forEach((point) => {
        const alpha = Math.max(0, 1 - point.age / FADE_DURATION);
        const radius = DOT_RADIUS * (0.4 + alpha * 0.6);
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 4);

        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.18})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.05})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Main pointer dot
      if (pointer) {
        const dotGradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, DOT_RADIUS * 3);

        dotGradient.addColorStop(0, "rgba(255, 255, 255, 0.36)");
        dotGradient.addColorStop(0.4, "rgba(255, 255, 255, 0.12)");
        dotGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = dotGradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, DOT_RADIUS * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reducedMotion]);

  return (
    <canvas
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-screen"
      ref={canvasRef}
    />
  );
}
