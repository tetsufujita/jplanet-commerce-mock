"use client";

import { useGSAP } from "@gsap/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { cx } from "@/lib/classnames";
import { gsap } from "@/lib/gsap";

export type SpiralPanel = {
  /** Stable id. */
  id: string;
  /** Eyebrow / category tag shown small. */
  tag: string;
  /** Big title. */
  title: string;
  /** One-liner under the title in the gallery view. */
  preview: string;
  /** Full content shown when this panel is opened (rich JSX). */
  content: ReactNode;
  /** Optional accent color for the panel (hex). */
  accent?: string;
};

type Props = {
  panels: SpiralPanel[];
};

/**
 * Asymmetric layout — one panel sits front-and-center (large), the others
 * scatter behind/around it at smaller scales and dramatic angles. Inspired by
 * Active Theory's /work compositions where one project dominates the frame.
 */
function spiralPosition(index: number, total: number, featureIndex: number) {
  // Distance from the featured slot (positive int)
  const rel = index - featureIndex;

  // Featured panel — front and center, big
  if (rel === 0) {
    return { opacity: 1, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, x: 0, y: -10, z: 240 };
  }

  // Other panels: scatter around in a half-orbit behind the featured one
  const side = Math.sign(rel); // -1 left, +1 right
  const depth = Math.abs(rel); // 1, 2, 3, ...
  const cap = Math.max(1, Math.floor(total / 2));
  const ratio = Math.min(1, depth / cap);

  // Horizontal: alternating sides, further out as depth increases
  const x = side * (320 + depth * 220);
  // Vertical: gentle zig-zag
  const y = (depth % 2 === 0 ? -1 : 1) * (60 + depth * 30) * (side === -1 ? 1 : -1) * 0.5 - 20;
  // Depth: push way back behind the featured
  const z = -120 - depth * 220;
  // Rotation: panels tilt toward viewer's center
  const rotateY = -side * (22 + depth * 10);
  const rotateZ = side * (4 + depth * 2);
  const rotateX = -3 - depth * 1;

  const scale = Math.max(0.55, 0.92 - depth * 0.13);
  const opacity = Math.max(0.18, 0.92 - ratio * 0.7);

  return { opacity, rotateX, rotateY, rotateZ, scale, x, y, z };
}

/**
 * SpiralGallery3D arranges N panels in a 3D arc spiraling around the viewer.
 * Each panel is clickable: click → animate to center as full-screen "main view"
 * with its expanded content. Click the close button (or background) to return.
 */
export function SpiralGallery3D({ panels }: Props) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Initial spiral positions for each panel (no rerun on hover/open)
  useGSAP(
    () => {
      const stage = stageRef.current;

      if (!stage || reducedMotion) {
        return;
      }

      panels.forEach((panel, index) => {
        const node = panelRefs.current[index];

        if (!node) {
          return;
        }

        const pos = spiralPosition(index, panels.length, featuredIndex);

        gsap.set(node, {
          opacity: pos.opacity,
          rotateX: pos.rotateX,
          rotateY: pos.rotateY,
          rotateZ: pos.rotateZ,
          scale: pos.scale,
          transformPerspective: 1800,
          x: pos.x,
          y: pos.y,
          z: pos.z,
        });
      });
    },
    { dependencies: [reducedMotion, panels.length, featuredIndex], revertOnUpdate: true, scope: stageRef },
  );

  // Subtle ambient float: each panel oscillates gently
  useEffect(() => {
    if (reducedMotion) return;

    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;

      panelRefs.current.forEach((node, index) => {
        if (!node || openId) return;
        const wobble = Math.sin(elapsed * 0.5 + index * 1.3) * 6;
        node.style.setProperty("--wobble", `${wobble}px`);
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [openId, reducedMotion]);

  // Open animation: bring clicked panel forward + hide others
  useEffect(() => {
    if (reducedMotion) return;

    panelRefs.current.forEach((node, index) => {
      const panel = panels[index];

      if (!node || !panel) return;

      const isOpen = panel.id === openId;
      const otherOpen = openId !== null && !isOpen;

      if (isOpen) {
        gsap.to(node, {
          duration: 0.9,
          ease: "expo.out",
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1.18,
          x: 0,
          y: 0,
          z: 220,
        });
      } else if (otherOpen) {
        gsap.to(node, {
          duration: 0.6,
          ease: "power2.out",
          opacity: 0,
          scale: 0.85,
        });
      } else {
        // Return to spiral
        const pos = spiralPosition(index, panels.length, featuredIndex);
        gsap.to(node, {
          duration: 0.8,
          ease: "expo.out",
          opacity: pos.opacity,
          rotateX: pos.rotateX,
          rotateY: pos.rotateY,
          rotateZ: pos.rotateZ,
          scale: pos.scale,
          x: pos.x,
          y: pos.y,
          z: pos.z,
        });
      }
    });
  }, [openId, panels, reducedMotion, featuredIndex]);

  // ESC closes the open panel
  useEffect(() => {
    if (!openId) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const handlePanelClick = useCallback(
    (id: string, index: number) => {
      // Non-featured panel: bring it to center first (no modal)
      if (index !== featuredIndex) {
        setFeaturedIndex(index);
        return;
      }
      // Already featured: open modal
      setOpenId((current) => (current === id ? null : id));
    },
    [featuredIndex],
  );

  const goPrev = useCallback(() => {
    setFeaturedIndex((prev) => (prev - 1 + panels.length) % panels.length);
  }, [panels.length]);

  const goNext = useCallback(() => {
    setFeaturedIndex((prev) => (prev + 1) % panels.length);
  }, [panels.length]);

  const openPanel = panels.find((p) => p.id === openId) ?? null;
  const featuredPanel = panels[featuredIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Stage with perspective for 3D positioning */}
      <div
        className="relative h-screen w-full"
        ref={stageRef}
        style={{ perspective: "1800px", perspectiveOrigin: "50% 45%" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {panels.map((panel, index) => {
            const isOpen = openId === panel.id;
            const isHover = hoverId === panel.id;

            return (
              <button
                aria-expanded={isOpen}
                className={cx(
                  "group absolute left-1/2 top-1/2 -ml-[160px] -mt-[210px] flex h-[420px] w-[320px] flex-col items-start justify-between",
                  "rounded-[22px] border text-left will-change-transform",
                  "backdrop-blur-2xl backdrop-saturate-150 transition-[border-color,box-shadow] duration-300 ease-andes",
                  "border-andes-paper/18 bg-andes-paper/[0.07] text-andes-paper",
                  "shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)]",
                  isOpen && "pointer-events-none",
                )}
                key={panel.id}
                onBlur={() => setHoverId(null)}
                onClick={() => handlePanelClick(panel.id, index)}
                onFocus={() => setHoverId(panel.id)}
                onMouseEnter={() => setHoverId(panel.id)}
                onMouseLeave={() => setHoverId(null)}
                ref={(node) => {
                  panelRefs.current[index] = node;
                }}
                style={{
                  borderColor: isHover ? `${panel.accent ?? "#FAFAF7"}55` : undefined,
                  boxShadow: isHover
                    ? `0 35px 80px -20px ${panel.accent ?? "rgba(0,0,0,0.55)"}33, 0 0 0 1px ${panel.accent ?? "#FAFAF7"}22`
                    : undefined,
                  transform: "translateY(var(--wobble, 0px))",
                }}
                type="button"
              >
                {/* Specular sheen */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                  }}
                />
                <div className="flex w-full flex-col gap-3 p-6">
                  <span
                    className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-andes-paper/70"
                    style={{ color: panel.accent ?? undefined }}
                  >
                    {String(index + 1).padStart(2, "0")} / {panel.tag}
                  </span>
                  <h3 className="line-clamp-2 font-jp text-[clamp(1.2rem,1.6vw,1.6rem)] font-semibold leading-[1.18] tracking-[-0.025em] text-andes-paper">
                    {panel.title}
                  </h3>
                </div>
                <div className="flex w-full items-center justify-between gap-4 p-6 pt-0">
                  <p className="line-clamp-2 font-jp text-[12px] leading-[1.55] text-andes-paper/72">
                    {panel.preview}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-andes-paper/85">
                    Open
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pagination + featured label (Active Theory style) */}
        {!openId ? (
          <div className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-4 text-andes-paper">
            <button
              aria-label="Previous panel"
              className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-andes-paper/30 text-sm transition hover:border-andes-paper hover:bg-andes-paper/10"
              onClick={goPrev}
              type="button"
            >
              <span aria-hidden>‹</span>
            </button>
            <div className="min-w-[200px] text-center">
              <span className="block font-display text-[10px] font-medium uppercase tracking-[0.3em] text-andes-paper/60">
                {String(featuredIndex + 1).padStart(2, "0")} / {String(panels.length).padStart(2, "0")} · {featuredPanel?.tag ?? ""}
              </span>
              <span className="mt-1 block font-jp text-[14px] font-medium text-andes-paper/90">
                {featuredPanel?.title ?? ""}
              </span>
            </div>
            <button
              aria-label="Next panel"
              className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-andes-paper/30 text-sm transition hover:border-andes-paper hover:bg-andes-paper/10"
              onClick={goNext}
              type="button"
            >
              <span aria-hidden>›</span>
            </button>
          </div>
        ) : null}

        {/* Side hint */}
        {!openId ? (
          <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 rotate-90 font-display text-[10px] uppercase tracking-[0.3em] text-andes-paper/40 lg:block">
            Click center to open
          </div>
        ) : null}
      </div>

      {/* Expanded overlay content */}
      {openPanel ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-6 py-16 sm:px-12 sm:py-20 lg:px-24 lg:py-24"
          onClick={() => setOpenId(null)}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div
            className="relative max-h-[80vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-andes-paper/18 bg-andes-deep/85 p-8 text-andes-paper shadow-[0_50px_120px_-30px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-12 lg:p-16"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-start justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span
                  className="font-display text-[11px] font-medium uppercase tracking-[0.24em] text-andes-paper/65"
                  style={{ color: openPanel.accent ?? undefined }}
                >
                  {openPanel.tag}
                </span>
                <h2 className="max-w-3xl font-jp text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-andes-paper">
                  {openPanel.title}
                </h2>
              </div>
              <button
                aria-label="Close"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-andes-paper/30 text-andes-paper transition hover:border-andes-paper hover:bg-andes-paper/10"
                onClick={() => setOpenId(null)}
                type="button"
              >
                <span aria-hidden className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>
            {openPanel.content}
          </div>
        </div>
      ) : null}
    </div>
  );
}
