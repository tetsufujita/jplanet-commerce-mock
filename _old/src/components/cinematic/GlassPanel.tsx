"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { cx } from "@/lib/classnames";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  /** Optional id for in-page links. */
  id?: string;
  /** Optional className for the outer wrapper. */
  className?: string;
  /** Optional className for the panel itself. */
  panelClassName?: string;
  /** Stagger position relative to viewport (-1 = enters from far left, 1 = far right). */
  drift?: number;
  /** "light" = lighter inner; "dark" = deeper backdrop (for Ch.7-like inversion). */
  tone?: "light" | "dark";
};

export function GlassPanel({
  children,
  className,
  drift = 0,
  id,
  panelClassName,
  tone = "light",
}: Props) {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const panel = panelRef.current;

      if (!wrapper || !panel || reducedMotion) {
        return;
      }

      // Initial state — panel arrives from above, slightly tilted
      gsap.set(panel, {
        filter: "blur(8px)",
        opacity: 0,
        rotateX: -10,
        rotateY: drift * 6,
        transformPerspective: 1200,
        y: -120,
      });

      // Reveal once when panel enters viewport
      const revealTrigger = ScrollTrigger.create({
        once: true,
        start: "top 78%",
        trigger: wrapper,
        onEnter: () => {
          gsap.to(panel, {
            duration: 1.05,
            ease: "expo.out",
            filter: "blur(0px)",
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            y: 0,
          });
        },
      });

      // Scroll-driven tilt while in viewport (subtle 3D parallax)
      const scrubTrigger = ScrollTrigger.create({
        end: "bottom top",
        scrub: 0.6,
        start: "top bottom",
        trigger: wrapper,
        onUpdate: (self) => {
          const t = self.progress * 2 - 1; // -1 .. 1
          gsap.set(panel, {
            rotateX: t * -4,
            rotateY: drift * 4 + t * 1.5,
            y: t * 24,
          });
        },
      });

      return () => {
        revealTrigger.kill();
        scrubTrigger.kill();
      };
    },
    {
      dependencies: [reducedMotion, drift],
      revertOnUpdate: true,
      scope: wrapperRef,
    },
  );

  return (
    <div
      className={cx("relative isolate w-full", className)}
      id={id}
      ref={wrapperRef}
      style={{ perspective: 1600 }}
    >
      <div
        className={cx(
          "relative mx-auto w-full max-w-6xl will-change-transform",
          // Rounded glass panel with backdrop blur + subtle border
          "rounded-[28px] border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]",
          tone === "dark"
            ? "border-andes-paper/8 bg-andes-deep/55 text-andes-paper backdrop-blur-2xl backdrop-saturate-150"
            : "border-andes-paper/14 bg-andes-paper/[0.06] text-andes-paper backdrop-blur-2xl backdrop-saturate-150",
          // Inner padding
          "px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20",
          panelClassName,
        )}
        ref={panelRef}
      >
        {/* Specular highlight along the top edge — gives the "glass sheen" */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
          }}
        />
        {/* Subtle chromatic edge highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[29px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,180,200,0.18) 0%, transparent 30%, transparent 70%, rgba(120,200,255,0.18) 100%)",
            mixBlendMode: "screen",
          }}
        />
        {children}
      </div>
    </div>
  );
}
