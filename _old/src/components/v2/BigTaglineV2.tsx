"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionWrapper } from "@/components/v2/SectionWrapper";

type Props = {
  /** Always-visible opening clause, rendered in full white. */
  lead: string;
  /** Sequential clauses that fade gray → white as the section enters viewport. */
  clauses: string[];
};

/**
 * Shopify-style oversized statement: "lead. clauseA. clauseB. clauseC."
 * Clauses start gray and brighten one-by-one once the block enters the
 * viewport, giving a paced reveal without GSAP.
 */
export function BigTaglineV2({ clauses, lead }: Props) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [activeCount, setActiveCount] = useState(reducedMotion ? clauses.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setActiveCount(clauses.length);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        clauses.forEach((_, index) => {
          window.setTimeout(() => {
            setActiveCount((current) => Math.max(current, index + 1));
          }, 350 + index * 380);
        });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -25%", threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [clauses, reducedMotion]);

  return (
    <SectionWrapper label={lead} rhythm="large">
      <h2
        className="max-w-[26ch] font-jp text-[clamp(2.2rem,5.2vw,4.6rem)] font-bold leading-[1.18] tracking-[-0.035em]"
        ref={ref}
      >
        <span className="text-white">{lead}</span>
        {clauses.map((clause, index) => {
          const active = index < activeCount;
          return (
            <span
              className="ml-3 inline-block transition-colors duration-700 ease-andes"
              key={clause}
              style={{ color: active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.28)" }}
            >
              {clause}
            </span>
          );
        })}
      </h2>
    </SectionWrapper>
  );
}
