"use client";

import NumberFlow from "@number-flow/react";
import { useInView, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cx } from "@/lib/classnames";

import type { SectionProps } from "./_kit";

type Rgb = { blue: number; green: number; red: number };
type SceneColors = {
  crimson: Rgb;
  ink: Rgb;
  muted: Rgb;
  paper: Rgb;
  slab: Rgb;
};
type SceneLayout = {
  dpr: number;
  height: number;
  mobile: boolean;
  px0: number;
  px1: number;
  railY: number;
  width: number;
  x0: number;
  x1: number;
};
type SceneLabels = {
  coordinate: string;
  saoPaulo: string;
  tokyo: string;
};

const TAU = Math.PI * 2;
const FINAL_PROGRESS = 0.86;
const SLAB_COUNT = 4;
const SKYLINE_HEIGHTS = [18, 34, 52, 72, 90, 64, 44, 28, 16] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function smoothStep(edge0: number, edge1: number, value: number): number {
  const progress = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function tokenRgb(tokenName: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  const hex = /^#?([\da-f]{6})$/i.exec(raw);
  if (hex?.[1]) {
    return {
      red: Number.parseInt(hex[1].slice(0, 2), 16),
      green: Number.parseInt(hex[1].slice(2, 4), 16),
      blue: Number.parseInt(hex[1].slice(4, 6), 16),
    };
  }

  const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(raw);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    return {
      red: Number.parseInt(rgb[1], 10),
      green: Number.parseInt(rgb[2], 10),
      blue: Number.parseInt(rgb[3], 10),
    };
  }

  return fallback;
}

function alpha(color: Rgb, opacity: number): string {
  return `rgba(${color.red},${color.green},${color.blue},${opacity})`;
}

function readSceneColors(): SceneColors {
  return {
    crimson: tokenRgb("--color-andes-crimson", { blue: 46, green: 16, red: 200 }),
    ink: tokenRgb("--color-andes-light-ink", { blue: 58, green: 33, red: 20 }),
    muted: tokenRgb("--color-andes-light-muted", { blue: 128, green: 113, red: 107 }),
    paper: tokenRgb("--color-andes-light-paper", { blue: 242, green: 246, red: 247 }),
    slab: tokenRgb("--color-andes-slab", { blue: 255, green: 255, red: 255 }),
  };
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function getSceneLayout(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): SceneLayout {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const mobile = width < 760;
  const railY = mobile ? height * 0.24 : height * 0.5;
  const px0 = mobile ? width * 0.1 : width * 0.5;
  const px1 = mobile ? width * 0.9 : width * 0.92;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    dpr,
    height,
    mobile,
    px0,
    px1,
    railY,
    width,
    x0: px0 + (mobile ? 6 : 14),
    x1: px1 - (mobile ? 14 : 30),
  };
}

function drawGlobeWhisper(
  context: CanvasRenderingContext2D,
  layout: SceneLayout,
  colors: SceneColors,
) {
  const { height, mobile, width } = layout;
  const globeX = mobile ? width * 0.5 : width * 0.72;
  const globeY = mobile ? height * 0.17 : height * 0.36;
  const globeRadius = mobile ? width * 0.3 : height * 0.4;

  context.save();
  context.strokeStyle = alpha(colors.ink, 0.06);
  context.lineWidth = 1;
  context.beginPath();
  context.arc(globeX, globeY, globeRadius, 0, TAU);
  context.stroke();

  context.fillStyle = alpha(colors.ink, 0.05);
  for (let index = 0; index < 150; index += 1) {
    const angle = index * 2.399963;
    const radius = Math.sqrt(index / 150) * globeRadius;
    context.fillRect(
      globeX + Math.cos(angle) * radius,
      globeY + Math.sin(angle) * radius * 0.6,
      1,
      1,
    );
  }

  context.strokeStyle = alpha(colors.crimson, 0.12);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(globeX - globeRadius * 0.55, globeY - globeRadius * 0.05);
  context.quadraticCurveTo(
    globeX,
    globeY - globeRadius * 0.8,
    globeX + globeRadius * 0.55,
    globeY + globeRadius * 0.2,
  );
  context.stroke();
  context.restore();
}

function drawPerspectiveRails(
  context: CanvasRenderingContext2D,
  layout: SceneLayout,
  colors: SceneColors,
) {
  const { mobile, px0, px1, railY, x0 } = layout;
  for (let index = 1; index <= 3; index += 1) {
    const y = railY - index * (mobile ? 14 : 18);
    context.strokeStyle = alpha(colors.ink, 0.06 * (1 - index / 4));
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(lerp(px0, x0, index / 3.5), y);
    context.lineTo(px1 - index * (mobile ? 8 : 14), y);
    context.stroke();
  }
}

function drawInfrastructureLayers(
  context: CanvasRenderingContext2D,
  layout: SceneLayout,
  colors: SceneColors,
  loadProgress: number,
) {
  const { mobile, px0, px1, railY } = layout;
  const slabHeight = mobile ? 11 : 14;
  const gap = mobile ? 15 : 19;
  const width = px1 - px0;

  context.save();
  for (let index = 0; index < SLAB_COUNT; index += 1) {
    const layerProgress = smoothStep(index * 0.12, index * 0.12 + 0.55, loadProgress);
    const targetY = railY + 14 + index * (slabHeight + gap);
    const y = targetY + (1 - layerProgress) * 40;

    context.globalAlpha = layerProgress;
    context.shadowColor = alpha(colors.ink, 0.16);
    context.shadowBlur = 18;
    context.shadowOffsetY = 9;
    context.fillStyle = alpha(colors.slab, 1);
    roundedRect(context, px0, y, width, slabHeight, 4);
    context.fill();

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.strokeStyle = alpha(colors.ink, 0.1);
    context.lineWidth = 1;
    roundedRect(context, px0, y, width, slabHeight, 4);
    context.stroke();

    if (index === 0) {
      context.fillStyle = alpha(colors.crimson, 0.72);
      roundedRect(context, px0, y, 3, slabHeight, 1.5);
      context.fill();
    }

    context.globalAlpha = 1;
  }
  context.restore();
}

function drawCommerceRail(
  context: CanvasRenderingContext2D,
  layout: SceneLayout,
  colors: SceneColors,
  loadProgress: number,
  scrollProgress: number,
) {
  const { railY, x0, x1 } = layout;
  const railProgress = smoothStep(0.45, 1, loadProgress);

  context.strokeStyle = alpha(colors.ink, 0.3);
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(x0, railY);
  context.lineTo(lerp(x0, x1, railProgress), railY);
  context.stroke();

  if (railProgress < 0.98) return;

  const pulseProgress = lerp(0.1, 0.97, scrollProgress);
  const pulseX = lerp(x0, x1, pulseProgress);
  const trailLength = 52;
  const gradient = context.createLinearGradient(pulseX - trailLength, 0, pulseX, 0);
  gradient.addColorStop(0, alpha(colors.crimson, 0));
  gradient.addColorStop(1, alpha(colors.crimson, 0.86));

  context.strokeStyle = gradient;
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(Math.max(x0, pulseX - trailLength), railY);
  context.lineTo(pulseX, railY);
  context.stroke();

  context.fillStyle = alpha(colors.crimson, 1);
  context.beginPath();
  context.arc(pulseX, railY, 2.6, 0, TAU);
  context.fill();

}

function drawTokyoNode(
  context: CanvasRenderingContext2D,
  layout: SceneLayout,
  colors: SceneColors,
  label: string,
) {
  const { railY, x0 } = layout;
  context.fillStyle = alpha(colors.ink, 0.85);
  context.beginPath();
  context.arc(x0, railY, 3.2, 0, TAU);
  context.fill();

  context.fillStyle = alpha(colors.ink, 0.5);
  context.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.textAlign = "left";
  context.fillText(label, x0 + 8, railY + 4);
}

function drawSaoPauloHub({
  colors,
  context,
  labels,
  layout,
  loadProgress,
  scrollProgress,
}: {
  colors: SceneColors;
  context: CanvasRenderingContext2D;
  labels: SceneLabels;
  layout: SceneLayout;
  loadProgress: number;
  scrollProgress: number;
}) {
  const { mobile, railY, x1 } = layout;
  const arrive = smoothStep(0.5, 0.95, scrollProgress);
  const saoBrightness = clamp(0.5 + 0.5 * arrive, 0, 1);
  const glowRadius = mobile ? 34 : 46;
  const glow = context.createRadialGradient(x1, railY, 0, x1, railY, glowRadius);
  glow.addColorStop(0, alpha(colors.crimson, 0.26 * saoBrightness));
  glow.addColorStop(0.5, alpha(colors.crimson, 0.07 * saoBrightness));
  glow.addColorStop(1, alpha(colors.crimson, 0));

  context.fillStyle = glow;
  context.beginPath();
  context.arc(x1, railY, glowRadius, 0, TAU);
  context.fill();

  const barWidth = mobile ? 3 : 4.4;
  const barGap = mobile ? 2.8 : 3.4;
  const skylineWidth = SKYLINE_HEIGHTS.length * barWidth + (SKYLINE_HEIGHTS.length - 1) * barGap;
  const startX = x1 - skylineWidth * 0.62;

  context.save();
  SKYLINE_HEIGHTS.forEach((height, index) => {
    const barProgress = smoothStep(0.55 + index * 0.045, 1.05 + index * 0.045, loadProgress);
    const barHeight = height * barProgress * (mobile ? 0.62 : 1);
    const x = startX + index * (barWidth + barGap);

    context.shadowColor = alpha(colors.ink, 0.12);
    context.shadowBlur = 8;
    context.shadowOffsetY = 3;
    context.fillStyle = alpha(colors.slab, 1);
    context.fillRect(x, railY - barHeight, barWidth, barHeight);

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.strokeStyle = alpha(colors.ink, 0.1);
    context.lineWidth = 0.8;
    context.strokeRect(x, railY - barHeight, barWidth, barHeight);

    if (index === 4) {
      context.fillStyle = alpha(colors.crimson, 0.7 + 0.3 * saoBrightness);
      context.fillRect(x, railY - barHeight, barWidth, 5);
      context.fillStyle = alpha(colors.crimson, saoBrightness);
      context.beginPath();
      context.arc(x + barWidth / 2, railY - barHeight - 6, 2.4 + 1.4 * arrive, 0, TAU);
      context.fill();
    }
  });
  context.restore();

  context.fillStyle = alpha(colors.crimson, 1);
  context.beginPath();
  context.arc(x1, railY, 3, 0, TAU);
  context.fill();

  context.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillStyle = alpha(colors.crimson, 0.92);
  if (mobile) {
    context.textAlign = "right";
    context.fillText(labels.saoPaulo, x1 - 8, railY + 4);
    context.fillStyle = alpha(colors.ink, 0.42);
    context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(labels.coordinate, x1 - 8, railY + 16);
  } else {
    context.textAlign = "left";
    context.fillText(labels.saoPaulo, x1 + 8, railY + 4);
    context.fillStyle = alpha(colors.ink, 0.42);
    context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(labels.coordinate, x1 + 8, railY + 16);
  }
}

function drawScene({
  colors,
  context,
  labels,
  layout,
  loadProgress,
  scrollProgress,
}: {
  colors: SceneColors;
  context: CanvasRenderingContext2D;
  labels: SceneLabels;
  layout: SceneLayout;
  loadProgress: number;
  scrollProgress: number;
}) {
  context.clearRect(0, 0, layout.width, layout.height);
  drawGlobeWhisper(context, layout, colors);
  drawPerspectiveRails(context, layout, colors);
  drawInfrastructureLayers(context, layout, colors, loadProgress);
  drawCommerceRail(context, layout, colors, loadProgress, scrollProgress);
  drawTokyoNode(context, layout, colors, labels.tokyo);
  drawSaoPauloHub({
    colors,
    context,
    labels,
    layout,
    loadProgress,
    scrollProgress,
  });
}

function EmphasisLine({ emphasis, line }: { emphasis: string; line: string }) {
  const index = line.indexOf(emphasis);
  if (index < 0) return <>{line}</>;

  return (
    <>
      {line.slice(0, index)}
      <strong className="font-[580]">{emphasis}</strong>
      {line.slice(index + emphasis.length)}
    </>
  );
}

function MaskLine({ children, delay }: { children: ReactNode; delay: string }) {
  return (
    <span className="block overflow-hidden whitespace-nowrap pb-[0.06em]">
      <span className="andes-hero-light-line block" style={{ animationDelay: delay }}>
        {children}
      </span>
    </span>
  );
}

function localeForIntl(locale: string): string {
  if (locale === "ja") return "ja-JP";
  if (locale === "pt-BR") return "pt-BR";
  return "en-US";
}

function HeroStat({ locale }: { locale: string }) {
  const t = useTranslations("home.hero.stat");
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -12% 0px", once: true });
  const target = Number.parseFloat(t("value"));
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(() => (reduceMotion ? safeTarget : 0));

  useEffect(() => {
    if (reduceMotion || inView) setValue(safeTarget);
  }, [inView, reduceMotion, safeTarget]);

  return (
    <p
      ref={ref}
      className="mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[12.5px] tracking-[0.02em] text-andes-light-muted sm:mt-6"
    >
      <span className="font-semibold text-andes-light-ink">{t("label")}</span>
      <NumberFlow
        className="font-semibold tabular-nums text-andes-crimson [font-size:15px]"
        format={{ maximumFractionDigits: 0 }}
        locales={localeForIntl(locale)}
        prefix={t("prefix")}
        suffix={t("suffix")}
        value={value}
      />
      <span className="font-mono text-[10.5px] tracking-[0.14em] text-andes-light-muted">
        [{t("source")}]
      </span>
    </p>
  );
}

function HeroSceneFallback({ className, labels }: { className?: string; labels: SceneLabels }) {
  return (
    <svg
      aria-hidden
      className={cx("absolute inset-0 z-10 h-full w-full transition-opacity duration-300", className)}
      preserveAspectRatio="none"
      viewBox="0 0 1000 620"
    >
      <circle
        cx="720"
        cy="220"
        fill="none"
        r="240"
        stroke="color-mix(in srgb, var(--color-andes-light-ink) 6%, transparent)"
      />
      <path
        d="M590 210 Q720 50 850 250"
        fill="none"
        stroke="color-mix(in srgb, var(--color-andes-crimson) 14%, transparent)"
      />
      {Array.from({ length: SLAB_COUNT }, (_, index) => (
        <rect
          fill="var(--color-andes-slab)"
          height="14"
          key={index}
          rx="4"
          stroke="color-mix(in srgb, var(--color-andes-light-ink) 10%, transparent)"
          width="420"
          x="500"
          y={324 + index * 33}
        />
      ))}
      <rect fill="var(--color-andes-crimson)" height="14" rx="1.5" width="3" x="500" y="324" />
      <line
        stroke="color-mix(in srgb, var(--color-andes-light-ink) 30%, transparent)"
        strokeWidth="1.5"
        x1="514"
        x2="890"
        y1="310"
        y2="310"
      />
      <circle cx="514" cy="310" fill="var(--color-andes-light-ink)" r="3.2" />
      <circle cx="890" cy="310" fill="var(--color-andes-crimson)" r="3.2" />
      <circle
        cx="890"
        cy="310"
        fill="color-mix(in srgb, var(--color-andes-crimson) 18%, transparent)"
        r="44"
      />
      {SKYLINE_HEIGHTS.map((height, index) => {
        const barWidth = 4.4;
        const gap = 3.4;
        const x = 874 + index * (barWidth + gap);
        const y = 310 - height;
        return (
          <g key={index}>
            <rect
              fill={index === 4 ? "var(--color-andes-crimson)" : "var(--color-andes-slab)"}
              height={height}
              width={barWidth}
              x={x}
              y={y}
            />
          </g>
        );
      })}
      <text
        fill="color-mix(in srgb, var(--color-andes-light-ink) 50%, transparent)"
        fontFamily="ui-monospace, monospace"
        fontSize="10"
        x="522"
        y="314"
      >
        {labels.tokyo}
      </text>
      <text
        fill="var(--color-andes-crimson)"
        fontFamily="ui-monospace, monospace"
        fontSize="10"
        x="898"
        y="314"
      >
        {labels.saoPaulo}
      </text>
      <text
        fill="color-mix(in srgb, var(--color-andes-light-ink) 42%, transparent)"
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        x="898"
        y="326"
      >
        {labels.coordinate}
      </text>
    </svg>
  );
}

export function Hero({ locale }: SectionProps) {
  const t = useTranslations("home.hero");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollProgressRef = useRef(0);
  const visibleRef = useRef(true);
  const [canvasReady, setCanvasReady] = useState(false);

  const labels: SceneLabels = useMemo(
    () => ({
      coordinate: t("coord"),
      saoPaulo: t("node.saopaulo"),
      tokyo: t("node.tokyo"),
    }),
    [t],
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    scrollProgressRef.current = clamp(value, 0, 1);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let layout = getSceneLayout(canvas, context);
    const colors = readSceneColors();
    const start = performance.now();
    const forcedRaw = new URLSearchParams(window.location.search).get("p");
    const parsedForced = forcedRaw === null ? Number.NaN : Number.parseFloat(forcedRaw);
    const forcedProgress = Number.isFinite(parsedForced) ? clamp(parsedForced, 0, 1) : null;
    const hasForcedProgress = forcedProgress !== null;
    let didMarkReady = false;

    const render = (time: number) => {
      const reduce = reduceMotion === true;
      const elapsed = (time - start) / 1000;
      const scrollProgress = reduce
        ? FINAL_PROGRESS
        : hasForcedProgress
          ? forcedProgress
          : scrollProgressRef.current;
      const loadProgress = reduce || hasForcedProgress ? 1 : smoothStep(0, 1.4, elapsed);

      drawScene({
        colors,
        context,
        labels,
        layout,
        loadProgress,
        scrollProgress,
      });

      if (!didMarkReady) {
        didMarkReady = true;
        setCanvasReady(true);
      }
    };

    const loop = (time: number) => {
      if (visibleRef.current || hasForcedProgress || reduceMotion === true) render(time);
      animationRef.current = window.requestAnimationFrame(loop);
    };

    const resize = () => {
      layout = getSceneLayout(canvas, context);
      render(performance.now());
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "160px" },
    );

    observer.observe(section);
    resize();
    animationRef.current = window.requestAnimationFrame(loop);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    };
  }, [labels, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-[260vh] bg-andes-light-paper text-andes-light-ink"
      data-header-theme-end
    >
      <style>{`
        @keyframes andesHeroLightLine {
          from {
            transform: translateY(108%);
          }
          to {
            transform: translateY(0);
          }
        }

        .andes-hero-light-line {
          animation: andesHeroLightLine 1s var(--ease-andes) forwards;
          transform: translateY(108%);
        }

        @media (prefers-reduced-motion: reduce) {
          .andes-hero-light-line {
            animation: none;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="sticky top-0 h-screen overflow-hidden bg-andes-light-paper">
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-andes-light-ink) 4.5%, transparent) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <HeroSceneFallback className={canvasReady ? "opacity-0" : "opacity-100"} labels={labels} />
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cx(
            "absolute inset-0 z-20 h-full w-full transition-opacity duration-300",
            canvasReady ? "opacity-100" : "opacity-0",
          )}
        />

        <div className="absolute left-[7vw] top-1/2 z-30 max-w-[33ch] -translate-y-[52%] max-[760px]:inset-x-0 max-[760px]:top-auto max-[760px]:bottom-[7vh] max-[760px]:translate-y-0 max-[760px]:px-6">
          <div aria-hidden className="mb-[18px] h-0.5 w-[26px] rounded-full bg-andes-crimson" />
          <p className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-andes-light-muted">
            {t("eyebrow")}
          </p>

          <h1
            aria-label={t("h1.label")}
            className="mt-4 font-display text-[clamp(38px,4.4vw,56px)] font-normal leading-[1.14] tracking-[-0.02em] text-andes-light-ink max-[760px]:text-[32px]"
          >
            <MaskLine delay="0s">{t("h1.line1")}</MaskLine>
            <MaskLine delay="0.07s">{t("h1.line2")}</MaskLine>
            <MaskLine delay="0.14s">
              <EmphasisLine emphasis={t("h1.emphasis")} line={t("h1.line3")} />
            </MaskLine>
          </h1>

          <p className="mt-5 max-w-[30ch] text-[clamp(14px,1.4vw,16.5px)] leading-[1.65] text-andes-light-muted sm:mt-6">
            {t("sub")}
          </p>

          <HeroStat locale={locale} />

          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Link
              className="rounded-md bg-andes-crimson px-[22px] py-3 text-sm font-semibold text-white transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson"
              href={`/${locale}/contact`}
            >
              {t("cta.primary")}
            </Link>
            <Link
              className="rounded-md border border-andes-light-ink/10 bg-white px-[22px] py-3 text-sm font-semibold text-andes-light-ink transition hover:border-andes-crimson/30 hover:text-andes-crimson active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-crimson"
              href={`/${locale}/businesses`}
            >
              {t("cta.secondary")}
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-5 z-30 flex justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-andes-light-muted/60 [@media(prefers-reduced-motion:reduce)]:hidden"
        >
          Scroll
        </div>
      </div>
    </section>
  );
}
