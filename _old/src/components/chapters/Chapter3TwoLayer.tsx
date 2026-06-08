"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { gsap } from "@/lib/gsap";

export type Chapter3Copy = {
  layer1Body: string;
  layer1Tag: string;
  layer1Title: string;
  layer2Body: string;
  layer2Tag: string;
  layer2Title: string;
  subtitle: string;
  title: string;
};

export function Chapter3TwoLayer({ copy }: { copy: Chapter3Copy }) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const drawables = Array.from(section.querySelectorAll<SVGGeometryElement>("[data-line-draw]"));

      drawables.forEach((item) => {
        const length = item.getTotalLength();
        gsap.set(item, { strokeDasharray: length, strokeDashoffset: length });
      });

      if (reducedMotion) {
        gsap.set(drawables, { strokeDashoffset: 0 });
        gsap.set("[data-layer-copy]", { opacity: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      timeline
        .to("[data-line-draw='box-1']", { strokeDashoffset: 0, ease: "none" })
        .to("[data-layer-copy='one']", { opacity: 1, y: 0, ease: "none" }, "<0.15")
        .to("[data-line-draw='arrow']", { strokeDashoffset: 0, ease: "none" })
        .to("[data-line-draw='box-2']", { strokeDashoffset: 0, ease: "none" })
        .to("[data-layer-copy='two']", { opacity: 1, y: 0, ease: "none" }, "<0.15");
    },
    { dependencies: [reducedMotion, copy.title], scope: sectionRef, revertOnUpdate: true },
  );

  return (
    <section
      aria-label={copy.title}
      className="relative min-h-[200vh] overflow-clip text-andes-paper"
      data-cinematic-from="var(--color-andes-forest)"
      data-cinematic-to="var(--color-andes-moss)"
      ref={sectionRef}
    >
      <div className="sticky top-0 z-10 grid min-h-screen items-center px-5 py-24 sm:px-8 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,color-mix(in_oklab,var(--color-andes-paper)_14%,transparent),transparent_30%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0">
            <p className="mb-5 font-body text-xs font-semibold uppercase text-andes-paper/55">
              {copy.layer1Tag} / {copy.layer2Tag}
            </p>
            <h2 className="max-w-[11ch] font-display text-[clamp(3.4rem,8vw,8rem)] font-bold leading-[0.88] tracking-[-0.055em]">
              {copy.title}
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-andes-paper/72">{copy.subtitle}</p>
          </div>

          <div className="relative min-h-[34rem]">
            <svg
              aria-hidden
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 760 760"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M135 110H625Q670 110 670 155V265Q670 310 625 310H135Q90 310 90 265V155Q90 110 135 110Z"
                data-line-draw="box-1"
                fill="none"
                stroke="var(--color-andes-paper)"
                strokeWidth="2"
              />
              <path
                d="M380 338V420M346 388L380 422L414 388"
                data-line-draw="arrow"
                fill="none"
                stroke="var(--color-andes-paper)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M135 452H625Q670 452 670 497V607Q670 652 625 652H135Q90 652 90 607V497Q90 452 135 452Z"
                data-line-draw="box-2"
                fill="none"
                stroke="var(--color-andes-paper)"
                strokeWidth="2"
              />
            </svg>
            <div
              className="absolute left-[13%] top-[19%] max-w-[62%] opacity-0"
              data-layer-copy="one"
            >
              <p className="text-xs font-semibold uppercase text-andes-paper/50">{copy.layer1Tag}</p>
              <h3 className="mt-3 font-display text-[clamp(2rem,4vw,4.2rem)] font-semibold leading-none tracking-[-0.04em]">
                {copy.layer1Title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-andes-paper/64">{copy.layer1Body}</p>
            </div>
            <div
              className="absolute left-[13%] top-[64%] max-w-[62%] opacity-0"
              data-layer-copy="two"
            >
              <p className="text-xs font-semibold uppercase text-andes-paper/50">{copy.layer2Tag}</p>
              <h3 className="mt-3 font-display text-[clamp(2rem,4vw,4.2rem)] font-semibold leading-none tracking-[-0.04em]">
                {copy.layer2Title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-andes-paper/64">{copy.layer2Body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
