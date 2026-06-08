"use client";

import { LogoMarquee } from "@/components/v2/LogoMarquee";
import { SectionWrapper } from "@/components/v2/SectionWrapper";

type Props = {
  eyebrow: string;
  brands: string[];
};

/**
 * Quiet logo strip — eyebrow + infinite marquee of partner / catalog brand
 * names. Uses text placeholders for now; swap for SVG marks when assets land.
 */
export function BrandStripV2({ brands, eyebrow }: Props) {
  return (
    <SectionWrapper label={eyebrow} rhythm="small">
      <div className="flex flex-col gap-8">
        <span className="font-display text-[10px] font-medium uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
          {eyebrow}
        </span>
        <LogoMarquee
          duration={48}
          items={brands.map((brand) => (
            <span
              className="whitespace-nowrap font-display text-[clamp(1rem,1.3vw,1.25rem)] font-medium uppercase tracking-[0.18em] text-white/82"
              key={brand}
            >
              {brand}
            </span>
          ))}
        />
      </div>
    </SectionWrapper>
  );
}
