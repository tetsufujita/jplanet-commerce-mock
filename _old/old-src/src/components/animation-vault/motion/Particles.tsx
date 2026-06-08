"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/classnames";

type MousePosition = {
  x: number;
  y: number;
};

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

type ParticlesProps = ComponentPropsWithoutRef<"div"> & {
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  colorToken?: string;
  vx?: number;
  vy?: number;
};

const fallbackRgb: [number, number, number] = [250, 250, 247];

function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

function parseCssColor(value: string): [number, number, number] {
  const hex = value.trim().replace("#", "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const [red, green, blue] = hex.split("").map((char) => parseInt(`${char}${char}`, 16));
    return [red ?? fallbackRgb[0], green ?? fallbackRgb[1], blue ?? fallbackRgb[2]];
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const hexInt = parseInt(hex, 16);
    return [(hexInt >> 16) & 255, (hexInt >> 8) & 255, hexInt & 255];
  }

  const rgb = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return fallbackRgb;
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}

export function Particles({
  className,
  quantity = 72,
  staticity = 48,
  ease = 54,
  size = 0.4,
  refresh = false,
  colorToken = "--color-andes-paper",
  vx = 0,
  vy = 0,
  ...props
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const reduced = useReducedMotionPreference();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const rafId = useRef<number | null>(null);
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rgb = useRef<[number, number, number]>(fallbackRgb);
  const dpr = useRef(1);
  const initCanvasRef = useRef<() => void>(() => undefined);
  const animateRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    dpr.current = window.devicePixelRatio || 1;
    const tokenValue = getComputedStyle(document.documentElement).getPropertyValue(colorToken);
    rgb.current = parseCssColor(tokenValue);
  }, [colorToken]);

  useEffect(() => {
    if (reduced) return undefined;

    context.current = canvasRef.current?.getContext("2d") ?? null;
    initCanvasRef.current();
    animateRef.current();

    const handleResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => initCanvasRef.current(), 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [colorToken, ease, quantity, reduced, size, staticity, vx, vy]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const { w, h } = canvasSize.current;
    const x = mousePosition.x - rect.left - w / 2;
    const y = mousePosition.y - rect.top - h / 2;
    const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;

    if (inside) mouse.current = { x, y };
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    if (!reduced) initCanvasRef.current();
  }, [refresh, reduced]);

  const circleParams = (): Circle => ({
    alpha: 0,
    dx: (Math.random() - 0.5) * 0.1,
    dy: (Math.random() - 0.5) * 0.1,
    magnetism: 0.1 + Math.random() * 4,
    size: Math.floor(Math.random() * 2) + size,
    targetAlpha: Number((Math.random() * 0.52 + 0.08).toFixed(1)),
    translateX: 0,
    translateY: 0,
    x: Math.floor(Math.random() * canvasSize.current.w),
    y: Math.floor(Math.random() * canvasSize.current.h),
  });

  const drawCircle = (circle: Circle, update = false) => {
    if (!context.current) return;

    const { alpha, size: circleSize, translateX, translateY, x, y } = circle;
    context.current.translate(translateX, translateY);
    context.current.beginPath();
    context.current.arc(x, y, circleSize, 0, 2 * Math.PI);
    context.current.fillStyle = `rgba(${rgb.current.join(", ")}, ${alpha})`;
    context.current.fill();
    context.current.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);

    if (!update) circles.current.push(circle);
  };

  const clearContext = () => {
    context.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
  };

  const resizeCanvas = () => {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;

    canvasSize.current = {
      h: canvasContainerRef.current.offsetHeight,
      w: canvasContainerRef.current.offsetWidth,
    };

    canvasRef.current.width = canvasSize.current.w * dpr.current;
    canvasRef.current.height = canvasSize.current.h * dpr.current;
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;
    context.current.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);

    circles.current = [];
    for (let i = 0; i < quantity; i += 1) drawCircle(circleParams());
  };

  const initCanvas = () => {
    resizeCanvas();
    clearContext();
    for (let i = 0; i < quantity; i += 1) drawCircle(circleParams());
  };

  const remapValue = (value: number, start1: number, end1: number, start2: number, end2: number) => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle, index) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = Number(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));

      if (remapClosestEdge > 1) {
        circle.alpha = Math.min(circle.alpha + 0.02, circle.targetAlpha);
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

      drawCircle(circle, true);

      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(index, 1);
        drawCircle(circleParams());
      }
    });

    rafId.current = window.requestAnimationFrame(() => animateRef.current());
  };

  initCanvasRef.current = initCanvas;
  animateRef.current = animate;

  if (reduced) {
    return <div aria-hidden="true" className={cx("pointer-events-none", className)} {...props} />;
  }

  return (
    <div aria-hidden="true" className={cx("pointer-events-none", className)} ref={canvasContainerRef} {...props}>
      <canvas className="size-full" ref={canvasRef} />
    </div>
  );
}
