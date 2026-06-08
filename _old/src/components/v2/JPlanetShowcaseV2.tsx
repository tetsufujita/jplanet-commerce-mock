"use client";

import Image from "next/image";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionHeading } from "@/components/v2/SectionHeading";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";

export type ShowcaseCard = {
  /** Eyebrow label inside the card. */
  tag: string;
  /** Headline shown over the imagery. */
  title: string;
  /** Supporting copy below the imagery. */
  body: string;
  /** Image asset rendered as the card hero. */
  image: { src: string; alt: string };
  /** Accent color (border / tag color). */
  accent: string;
};

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  cards: ShowcaseCard[];
};

export function JPlanetShowcaseV2({ body, cards, eyebrow, title }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <SectionWrapper id="showcase" label={title}>
      <SectionHeading body={body} eyebrow={eyebrow} title={title} />

      <ul className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-3 lg:gap-6">
        {cards.map((card, index) => (
          <ShowcaseCardItem card={card} index={index} key={card.title} reducedMotion={reducedMotion} />
        ))}
      </ul>
    </SectionWrapper>
  );
}

function ShowcaseCardItem({
  card,
  index,
  reducedMotion,
}: {
  card: ShowcaseCard;
  index: number;
  reducedMotion: boolean;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>();
  return (
    <li
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition duration-500 ease-andes hover:border-white/30 hover:bg-white/[0.07]"
      ref={ref}
      style={fadeUpStyle(visible, 0.08 * index, reducedMotion)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          alt={card.image.alt}
          className="object-cover transition-transform duration-700 ease-andes group-hover:scale-[1.03]"
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          src={card.image.src}
          unoptimized
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,20,40,0.2) 0%, rgba(10,20,40,0) 35%, rgba(10,20,40,0) 60%, rgba(10,20,40,0.8) 100%)",
          }}
        />
        <div className="absolute inset-x-6 bottom-6 flex flex-col gap-2">
          <span
            className="font-display text-[10px] font-medium uppercase tracking-[0.22em]"
            style={{ color: card.accent }}
          >
            {card.tag}
          </span>
          <h3 className="font-jp text-[clamp(1.3rem,1.9vw,1.7rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
            {card.title}
          </h3>
        </div>
      </div>
      <p className="flex-1 px-7 py-6 font-jp text-[13px] leading-[1.7] text-white/68 sm:text-[14px] sm:px-9 sm:py-7">
        {card.body}
      </p>
    </li>
  );
}
