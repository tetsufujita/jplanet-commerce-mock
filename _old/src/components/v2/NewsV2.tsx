"use client";

import Image from "next/image";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionHeading } from "@/components/v2/SectionHeading";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";

export type NewsItem = {
  date: string;
  category: string;
  title: string;
  body: string;
  href?: string;
  image?: { src: string; alt: string };
};

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  items: NewsItem[];
};

export function NewsV2({ body, eyebrow, items, title }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <SectionWrapper id="news" label={title}>
      <SectionHeading body={body} eyebrow={eyebrow} title={title} />

      <ul className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-3 lg:gap-6">
        {items.map((item, index) => (
          <NewsCard index={index} item={item} key={item.title} reducedMotion={reducedMotion} />
        ))}
      </ul>
    </SectionWrapper>
  );
}

function NewsCard({
  index,
  item,
  reducedMotion,
}: {
  index: number;
  item: NewsItem;
  reducedMotion: boolean;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>();
  const Wrapper = item.href ? "a" : "div";

  return (
    <li
      className="group h-full"
      ref={ref}
      style={fadeUpStyle(visible, 0.08 * index, reducedMotion)}
    >
      <Wrapper
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition duration-500 ease-andes hover:border-white/30 hover:bg-white/[0.07]"
        href={item.href}
      >
        {item.image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              alt={item.image.alt}
              className="object-cover transition-transform duration-700 ease-andes group-hover:scale-[1.04]"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              src={item.image.src}
              unoptimized
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,20,40,0) 0%, rgba(10,20,40,0) 60%, rgba(10,20,40,0.55) 100%)",
              }}
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col justify-between gap-6 p-7 sm:p-9">
          <div className="flex flex-col gap-3">
            <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
              {item.date} · {item.category}
            </span>
            <h3 className="font-jp text-[clamp(1.05rem,1.5vw,1.35rem)] font-bold leading-[1.3] tracking-[-0.015em] text-white">
              {item.title}
            </h3>
            <p className="font-jp text-[13px] leading-[1.65] text-white/65 sm:text-[14px]">
              {item.body}
            </p>
          </div>
          {item.href ? (
            <span className="inline-flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 transition group-hover:text-white">
              Read more
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </span>
          ) : null}
        </div>
      </Wrapper>
    </li>
  );
}
