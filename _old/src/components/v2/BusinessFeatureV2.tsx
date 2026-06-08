"use client";

import Image from "next/image";
import Link from "next/link";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { SplitChar } from "@/components/v2/SplitChar";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";
import type { Locale } from "@/i18n/routing";

type Bullet = {
  number: string;
  title: string;
  body: string;
};

type Props = {
  locale: Locale;
  /** Layout direction. "left" = photo left, content right (default). */
  imageSide?: "left" | "right";
  /** Eyebrow above title. */
  eyebrow: string;
  /** Big title. */
  title: string;
  /** Body paragraph. */
  body: string;
  /** Optional bullet items rendered as a small list below the body. */
  bullets?: Bullet[];
  /** Primary CTA. */
  ctaPrimary: { href: string; label: string };
  /** Optional secondary CTA. */
  ctaSecondary?: { href: string; label: string };
  /** Photo. */
  image: { src: string; alt: string };
  /** Optional accent color for eyebrow/bullets. */
  accent?: string;
};

export function BusinessFeatureV2({
  accent = "#F0E8C0",
  body,
  bullets,
  ctaPrimary,
  ctaSecondary,
  eyebrow,
  image,
  imageSide = "left",
  locale,
  title,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [eyebrowRef, eyebrowVisible] = useReveal<HTMLSpanElement>();
  const [bodyRef, bodyVisible] = useReveal<HTMLParagraphElement>();
  const [ctaRef, ctaVisible] = useReveal<HTMLDivElement>();
  const [bulletsRef, bulletsVisible] = useReveal<HTMLUListElement>();
  const [imageRef, imageVisible] = useReveal<HTMLDivElement>({ threshold: 0.1 });

  const imageOrder = imageSide === "left" ? "order-1" : "order-1 lg:order-2";
  const contentOrder = imageSide === "left" ? "order-2" : "order-2 lg:order-1";

  return (
    <SectionWrapper label={title}>
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:items-center">
        {/* Image */}
        <div
          className={`relative ${imageOrder} aspect-[4/5] w-full overflow-hidden rounded-[28px] lg:aspect-[5/6]`}
          ref={imageRef}
          style={{
            opacity: imageVisible || reducedMotion ? 1 : 0,
            transform:
              imageVisible || reducedMotion
                ? "translate3d(0, 0, 0) scale(1)"
                : "translate3d(0, 40px, 0) scale(1.02)",
            transition: reducedMotion
              ? "none"
              : "opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <Image
            alt={image.alt}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={image.src}
            unoptimized
          />
          {/* Soft gradient inside the image edges so the bg blends with navy */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,20,40,0.15) 0%, rgba(10,20,40,0) 30%, rgba(10,20,40,0) 70%, rgba(10,20,40,0.55) 100%)",
            }}
          />
          {/* Hairline border */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/12"
          />
        </div>

        {/* Content */}
        <div className={`${contentOrder} flex flex-col gap-7 lg:gap-9`}>
          <span
            className="block font-display text-[11px] font-medium uppercase tracking-[0.22em] sm:text-[13px] sm:tracking-[0.2em]"
            ref={eyebrowRef}
            style={{ color: accent, ...fadeUpStyle(eyebrowVisible, 0, reducedMotion) }}
          >
            {eyebrow}
          </span>
          <h2 className="max-w-[14ch] font-jp text-[clamp(2.4rem,5.4vw,4.6rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
            <SplitChar delay={0} text={title} />
          </h2>
          <p
            className="max-w-[44ch] font-jp text-[clamp(0.95rem,1.2vw,1.15rem)] font-light leading-[1.7] text-white/72"
            ref={bodyRef}
            style={fadeUpStyle(bodyVisible, 0.2, reducedMotion)}
          >
            {body}
          </p>

          {bullets ? (
            <ul
              className="grid gap-5 sm:grid-cols-2"
              ref={bulletsRef}
              style={fadeUpStyle(bulletsVisible, 0.3, reducedMotion)}
            >
              {bullets.map((bullet) => (
                <li className="flex flex-col gap-2" key={bullet.title}>
                  <span
                    className="font-display text-[11px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: accent }}
                  >
                    {bullet.number}
                  </span>
                  <span className="font-display text-[15px] font-medium text-white">{bullet.title}</span>
                  <span className="font-jp text-[13px] leading-[1.6] text-white/65">{bullet.body}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div
            className="flex flex-wrap items-center gap-6"
            ref={ctaRef}
            style={fadeUpStyle(ctaVisible, 0.4, reducedMotion)}
          >
            <Link
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0A1428] transition duration-300 ease-andes hover:bg-white/90 active:scale-[0.97]"
              href={`/${locale}${ctaPrimary.href}`}
            >
              {ctaPrimary.label}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            {ctaSecondary ? (
              <Link
                className="group inline-flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
                href={`/${locale}${ctaSecondary.href}`}
              >
                {ctaSecondary.label}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
