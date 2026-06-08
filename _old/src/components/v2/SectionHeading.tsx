"use client";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SplitChar } from "@/components/v2/SplitChar";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import { cx } from "@/lib/classnames";

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  className?: string;
};

/**
 * Shared section heading block: eyebrow → big title (Lusion-style char
 * reveal) → optional body. Padding and rhythm match Shopify Enterprise
 * sections.
 */
export function SectionHeading({ align = "left", body, className, eyebrow, title }: Props) {
  const reducedMotion = useReducedMotion();
  const [eyebrowRef, eyebrowVisible] = useReveal<HTMLSpanElement>();
  const [titleWrapperRef, titleVisible] = useReveal<HTMLHeadingElement>({ threshold: 0.2 });
  const [bodyRef, bodyVisible] = useReveal<HTMLParagraphElement>();

  return (
    <div
      className={cx(
        "flex flex-col gap-6 lg:gap-8",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <span
        className="block font-display text-[11px] font-medium uppercase tracking-[0.22em] text-white/60 sm:text-[13px] sm:tracking-[0.2em]"
        ref={eyebrowRef}
        style={fadeUpStyle(eyebrowVisible, 0, reducedMotion)}
      >
        {eyebrow}
      </span>
      <h2
        className="max-w-[18ch] font-jp text-[clamp(2.2rem,4.8vw,4.4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white"
        ref={titleWrapperRef}
      >
        {titleVisible || reducedMotion ? (
          <SplitChar delay={0} immediate text={title} />
        ) : (
          <span aria-label={title} className="invisible">
            {title}
          </span>
        )}
      </h2>
      {body ? (
        <p
          className={cx(
            "max-w-[52ch] font-jp text-[clamp(0.95rem,1.2vw,1.15rem)] font-light leading-[1.7] text-white/70",
            align === "center" && "mx-auto",
          )}
          ref={bodyRef}
          style={fadeUpStyle(bodyVisible, 0.2, reducedMotion)}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
