"use client";

import Image from "next/image";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SectionHeading } from "@/components/v2/SectionHeading";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";

export type CompanyEntity = {
  name: string;
  role: string;
  location: string;
  body: string;
};

export type CompanyStat = {
  value: string;
  label: string;
};

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  entities: CompanyEntity[];
  stats: CompanyStat[];
  /** Optional pair of city images shown side by side. */
  cityImages?: Array<{ src: string; alt: string; caption: string }>;
};

export function CompanyV2({ body, cityImages, entities, eyebrow, stats, title }: Props) {
  const reducedMotion = useReducedMotion();
  const [statsRef, statsVisible] = useReveal<HTMLDListElement>();

  return (
    <SectionWrapper id="company" label={title}>
      <SectionHeading body={body} eyebrow={eyebrow} title={title} />

      {cityImages && cityImages.length > 0 ? (
        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-2 lg:gap-6">
          {cityImages.map((img) => (
            <figure
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px]"
              key={img.src}
            >
              <Image
                alt={img.alt}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={img.src}
                unoptimized
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,20,40,0.1) 0%, rgba(10,20,40,0) 50%, rgba(10,20,40,0.7) 100%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10"
              />
              <figcaption className="absolute bottom-6 left-6 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-white/90">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
        {entities.map((entity, index) => (
          <EntityBlock entity={entity} index={index} key={entity.name} reducedMotion={reducedMotion} />
        ))}
      </div>

      <dl
        className="mt-20 grid grid-cols-3 gap-8 border-t border-white/10 pt-10 lg:mt-24 lg:gap-12 lg:pt-12"
        ref={statsRef}
        style={fadeUpStyle(statsVisible, 0.1, reducedMotion)}
      >
        {stats.map((stat) => (
          <div className="flex flex-col gap-2" key={stat.label}>
            <dt className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
              {stat.label}
            </dt>
            <dd className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light leading-none tracking-[-0.02em] text-white">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </SectionWrapper>
  );
}

function EntityBlock({
  entity,
  index,
  reducedMotion,
}: {
  entity: CompanyEntity;
  index: number;
  reducedMotion: boolean;
}) {
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <div
      className="flex flex-col gap-4 border-l border-white/15 pl-6 lg:pl-8"
      ref={ref}
      style={fadeUpStyle(visible, 0.08 * index, reducedMotion)}
    >
      <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
        {entity.role} · {entity.location}
      </span>
      <h3 className="font-jp text-[clamp(1.4rem,2vw,1.85rem)] font-medium leading-[1.25] tracking-[-0.015em] text-white">
        {entity.name}
      </h3>
      <p className="font-jp text-[14px] leading-[1.7] text-white/68 sm:text-[15px]">{entity.body}</p>
    </div>
  );
}
