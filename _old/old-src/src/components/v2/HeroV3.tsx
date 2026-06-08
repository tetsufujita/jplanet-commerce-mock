"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
};

type Card = {
  image: string;
  label: string;
  value: string;
  cta: string;
  note: { title: string; time: string; amount: string };
};

const HERO_PHOTO = "/images/hero-woman-wide.png";

const HERO_CARD: Card = {
  cta: "Accounts",
  image: HERO_PHOTO,
  label: "Personal",
  note: { amount: "+R$ 17.850", time: "Today, 11:28", title: "Salary" },
  value: "R$ 42.084",
};

const SIDE_CARDS: Card[] = [
  {
    cta: "Accounts",
    image: "/images/portrait-cafe.jpg",
    label: "Personal · EUR",
    note: { amount: "-€ 3,25", time: "Yesterday, 09:02", title: "Coffee in Paris" },
    value: "€ 3.126",
  },
  {
    cta: "Accounts",
    image: "/images/hero-sky-man-navy.jpg",
    label: "Personal",
    note: { amount: "-R$ 1.575", time: "Due today", title: "House bills" },
    value: "R$ 16.450",
  },
];

const NAV_ITEMS = ["Personal", "Business", "Kids & Teens", "Help", "Company"];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (n: number) => n * n * (3 - 2 * n);

export function HeroV3(props: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-hero-v3-preview", "true");
    style.textContent = `
      body:has(#andes-hero-v3-revolut) header.fixed,
      body:has(#andes-hero-v3-revolut) nextjs-portal {
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    const compute = () => {
      const node = sectionRef.current;
      if (!node) return;

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const total = node.offsetHeight - window.innerHeight;
        setProgress(total <= 0 ? 0 : clamp01(-rect.top / total));
      });
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      style.remove();
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const t = smooth(clamp01(progress / 0.86));
  const whiteOrigin = smooth(clamp01((t - 0.16) / 0.16));
  const whiteSpread = smooth(clamp01((t - 0.18) / 0.56));
  const whiteLift = smooth(clamp01((t - 0.36) / 0.42));
  const whitePanelAlpha = clamp01(whiteOrigin / 0.08);
  const finalWhite = smooth(clamp01((t - 0.84) / 0.16));
  const blueWash = smooth(clamp01((t - 0.1) / 0.46));
  const heroFade = clamp01(1 - smooth(clamp01((t - 0.03) / 0.7)) * 0.96);
  const cardMorph = smooth(clamp01((t - 0.06) / 0.55));
  const rowT = cardMorph;
  const finalCopy = smooth(clamp01((t - 0.18) / 0.55));
  const imageFade = smooth(clamp01((t - 0.035) / 0.17));
  const frameTop = lerp(30, 46.5, cardMorph);
  const frameWidth = lerp(29.2, 15.9, cardMorph);
  const frameHeight = lerp(86, 45.5, cardMorph);
  const frameRadius = lerp(28, 14, cardMorph);
  const whiteRadius = lerp(lerp(28, 46, whiteSpread), 0, finalWhite);

  return (
    <section
      aria-label="Revolut-style Andes preview hero"
      className="relative isolate w-full bg-white text-[#17191c]"
      data-locale={props.locale}
      id="andes-hero-v3-revolut"
      ref={sectionRef}
      style={{ height: "238vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#6fb3e2]">
        <div
          aria-hidden
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ opacity: 1 - finalWhite }}
        >
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={HERO_PHOTO}
            style={{
              objectPosition: "50% 64%",
              transform: `scale(${lerp(1.5, 1.07, t)}) translateY(${lerp(0, -4, t)}vh)`,
              transformOrigin: "50% 64%",
            }}
            unoptimized
          />
        </div>

        <div
          aria-hidden
          className="absolute inset-0 z-[1] bg-[#4f8fd2]"
          style={{ opacity: blueWash * 0.2 * (1 - finalWhite) }}
        />

        <div
          aria-hidden
          className="absolute inset-0 z-[2] bg-white"
          style={{ opacity: finalWhite }}
        />

        <div
          aria-hidden
          className="absolute left-1/2 z-10"
          style={{
            backfaceVisibility: "hidden",
            background: "#fff",
            borderRadius: `${whiteRadius}px`,
            height: `${lerp(86, 118, whiteLift)}vh`,
            opacity: whitePanelAlpha,
            overflow: "hidden",
            top: `${lerp(30, -8, whiteLift)}vh`,
            transform: "translateX(-50%)",
            transformOrigin: "50% 30vh",
            willChange: "width, height, top, border-radius",
            width: `${lerp(29.2, 112, whiteSpread)}vw`,
          }}
        />

        <HeroNav opacity={heroFade} />

        <div
          className="absolute z-[6] text-white"
          style={{
            left: "clamp(28px, 19.2vw, 280px)",
            opacity: heroFade,
            top: "clamp(140px, 22.8vh, 214px)",
            transform: `translateY(${-lerp(0, 60, t)}px)`,
          }}
        >
          <h1
            className="font-display font-bold leading-[0.98] tracking-[-0.064em]"
            style={{ fontSize: "clamp(4.25rem, 6.78vw, 6.1rem)" }}
          >
            <span className="block whitespace-nowrap">Change the way you</span>
            <span className="block">money</span>
          </h1>

          <p
            className="mt-7 max-w-[470px] font-display text-[clamp(1.03rem,1.45vw,1.32rem)] font-semibold leading-[1.32] tracking-[-0.025em] text-white"
            style={{ textShadow: "0 2px 14px rgba(25, 69, 105, 0.18)" }}
          >
            Home or away, local or global — move freely between countries and
            currencies. Sign up for free, in a tap.
          </p>

          <button
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#17191c] px-7 font-display text-[15px] font-bold tracking-[-0.018em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:bg-[#25272b] active:scale-[0.97]"
            type="button"
          >
            Download the app
          </button>
        </div>

        <div
          className="absolute left-1/2 z-30 overflow-hidden"
          style={{
            border: `${lerp(1.5, 0, t)}px solid rgba(255,255,255,${lerp(0.62, 0, t)})`,
            borderRadius: `${frameRadius}px`,
            boxShadow:
              t > 0.35
                ? `0 ${lerp(8, 26, rowT)}px ${lerp(26, 58, rowT)}px rgba(18, 20, 24, ${lerp(0.04, 0.16, rowT)})`
                : "none",
            height: `${frameHeight}vh`,
            maxHeight: `${lerp(775, 410, t)}px`,
            minHeight: `${lerp(675, 330, t)}px`,
            top: `${frameTop}vh`,
            transform: `translateX(-50%) scale(${lerp(1, 1.02, rowT)})`,
            width: `${frameWidth}vw`,
            maxWidth: `${lerp(420, 242, t)}px`,
            minWidth: `${lerp(360, 210, t)}px`,
          }}
        >
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(min-width:1024px) 18vw, 56vw"
            src={HERO_CARD.image}
            style={{
              opacity: imageFade,
              objectPosition: "50% 34%",
              transform: `translateY(${lerp(0, -18, rowT)}%) scale(${lerp(1.08, 1.65, rowT)})`,
              transformOrigin: "50% 52%",
            }}
            unoptimized
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                t > 0.18
                  ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,${lerp(0, 0.52, imageFade)}) 100%)`
                  : "transparent",
              opacity: imageFade,
            }}
          />
          <BalanceOverlay card={HERO_CARD} imageFade={imageFade} t={cardMorph} />
          <TransactionNote card={HERO_CARD} t={cardMorph} />
        </div>

        <div
          className="absolute left-1/2 z-10 w-[min(920px,82vw)] text-center"
          style={{
            opacity: finalCopy,
            top: "22.5vh",
            transform: `translateX(-50%) translateY(${lerp(34, 0, finalCopy)}px)`,
          }}
        >
          <h2 className="font-display text-[clamp(2.25rem,4.1vw,4.3rem)] font-bold leading-[1.02] tracking-[-0.058em] text-[#17191c]">
            Revolucione sua vida financeira
          </h2>
          <p className="mx-auto mt-5 max-w-[850px] font-display text-[clamp(1rem,1.45vw,1.38rem)] font-bold leading-[1.35] tracking-[-0.035em] text-[#2a2d31]">
            Faça câmbio de maneira inteligente, envie dinheiro rapidamente e gaste em mais de 30 moedas.
            <br />
            Tudo isso só com a Revolut!
          </p>
        </div>

        <div
          className="absolute left-1/2 z-20"
          style={{
            opacity: rowT,
            top: "46.5vh",
            transform: "translateX(-50%)",
          }}
        >
          <div className="relative h-[410px] w-[760px] max-w-[82vw]">
            <div
              className="absolute left-1/2 top-0"
              style={{
                transform: `translateX(calc(-50% - ${rowT * 258}px)) scale(${lerp(0.9, 1, rowT)})`,
                transformOrigin: "center top",
              }}
            >
              <SmallPhoneCard card={SIDE_CARDS[0]!} />
            </div>
            <div
              className="absolute left-1/2 top-0"
              style={{
                transform: `translateX(calc(-50% + ${rowT * 258}px)) scale(${lerp(0.9, 1, rowT)})`,
                transformOrigin: "center top",
              }}
            >
              <SmallPhoneCard card={SIDE_CARDS[1]!} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroNav({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute left-0 right-0 top-0 z-[6] hidden h-[96px] items-center md:flex"
      style={{ opacity }}
    >
      <div className="mx-auto flex w-full max-w-[920px] items-center justify-between">
        <div className="font-display text-[28px] font-bold tracking-[-0.075em] text-[#17191c]">
          Revolut
        </div>
        <nav aria-label="Preview navigation" className="flex items-center gap-9">
          {NAV_ITEMS.map((item) => (
            <a
              className="font-display text-[15px] font-bold tracking-[-0.03em] text-[#17191c] transition hover:opacity-70"
              href="#"
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <a
            className="font-display text-[15px] font-bold tracking-[-0.03em] text-[#17191c]"
            href="#"
          >
            Log in
          </a>
          <a
            className="inline-flex min-h-[52px] items-center rounded-full bg-[#17191c] px-8 font-display text-[15px] font-bold tracking-[-0.03em] text-white"
            href="#"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

function BalanceOverlay({ card, imageFade, t }: { card: Card; imageFade: number; t: number }) {
  return (
    <div
      className="absolute flex w-[86%] flex-col items-center text-center text-white"
      style={{
        gap: `${lerp(12, 8, t)}px`,
        left: `${lerp(68, 50, t)}%`,
        top: `${lerp(40, 43, t)}%`,
        transform: `translateX(-50%) translateY(-50%) scale(${lerp(1, 0.78, t)})`,
      }}
    >
      <span
        className="font-display font-medium tracking-[-0.035em] text-white"
        style={{
          fontSize: `${lerp(18, 13, t)}px`,
          opacity: lerp(0.96, 0.88, imageFade),
          textShadow: "0 2px 16px rgba(0,0,0,0.28)",
        }}
      >
        {card.label}
      </span>
      <span
        className="font-display font-bold leading-none tracking-[-0.06em] text-white"
        style={{
          fontSize: `clamp(${lerp(38, 31, t)}px, ${lerp(3.65, 2.1, t)}vw, ${lerp(56, 40, t)}px)`,
          textShadow: "0 3px 20px rgba(0,0,0,0.34)",
        }}
      >
        {card.value}
      </span>
      <button
        className="inline-flex items-center justify-center rounded-full bg-white font-display font-bold tracking-[-0.035em] text-[#25272b]"
        style={{
          fontSize: `${lerp(16, 11, t)}px`,
          minHeight: `${lerp(50, 34, t)}px`,
          padding: `0 ${lerp(28, 18, t)}px`,
        }}
        type="button"
      >
        {card.cta}
      </button>
    </div>
  );
}

function TransactionNote({ card, t }: { card: Card; t: number }) {
  return (
    <div
      className="absolute left-1/2 flex -translate-x-1/2 items-center bg-white"
      style={{
        borderRadius: `${lerp(18, 9, t)}px`,
        bottom: `${lerp(170, 12, t)}px`,
        boxShadow: "0 18px 34px rgba(17, 19, 24, 0.14)",
        gap: `${lerp(14, 9, t)}px`,
        minHeight: `${lerp(78, 54, t)}px`,
        padding: `${lerp(12, 8, t)}px ${lerp(18, 10, t)}px`,
        width: `${lerp(92, 86, t)}%`,
      }}
    >
      <span
        className="grid shrink-0 place-items-center rounded-full bg-[#5147f5] text-white"
        style={{
          height: `${lerp(42, 27, t)}px`,
          width: `${lerp(42, 27, t)}px`,
        }}
      >
        <CoinIcon size={lerp(21, 14, t)} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate font-display font-bold leading-tight tracking-[-0.035em] text-[#25272b]"
          style={{ fontSize: `${lerp(17, 11, t)}px` }}
        >
          {card.note.title}
        </span>
        <span
          className="truncate font-display font-medium leading-tight tracking-[-0.03em] text-[#71757d]"
          style={{ fontSize: `${lerp(14, 10, t)}px` }}
        >
          {card.note.time}
        </span>
      </span>
      <span
        className="font-display font-medium tracking-[-0.035em] text-[#25272b]"
        style={{ fontSize: `${lerp(16, 11, t)}px` }}
      >
        {card.note.amount}
      </span>
    </div>
  );
}

function SmallPhoneCard({ card }: { card: Card }) {
  return (
    <div className="relative h-[410px] w-[226px] overflow-hidden rounded-[14px] bg-[#d9dde4] shadow-[0_18px_42px_rgba(18,20,24,0.14)]">
      <Image
        alt=""
        className="object-cover"
        fill
        sizes="226px"
        src={card.image}
        style={{ objectPosition: card.image === HERO_PHOTO ? "50% 32%" : "50% 50%" }}
        unoptimized
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.64) 100%)",
        }}
      />
      <div className="absolute left-1/2 top-[52%] flex w-[84%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center text-white">
        <span className="font-display text-[10px] font-medium tracking-[-0.035em] text-white/82">
          {card.label}
        </span>
        <span className="font-display text-[28px] font-bold leading-none tracking-[-0.055em] text-white">
          {card.value}
        </span>
        <button
          className="mt-1 inline-flex min-h-[32px] items-center justify-center rounded-full bg-white px-5 font-display text-[11px] font-bold tracking-[-0.035em] text-[#25272b]"
          type="button"
        >
          {card.cta}
        </button>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex min-h-[55px] items-center gap-2 rounded-[8px] bg-white px-3 py-2 shadow-[0_12px_24px_rgba(17,19,24,0.12)]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#5147f5] text-white">
          <CoinIcon size={15} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-display text-[11px] font-bold leading-tight tracking-[-0.035em] text-[#25272b]">
            {card.note.title}
          </span>
          <span className="truncate font-display text-[10px] font-medium leading-tight tracking-[-0.03em] text-[#71757d]">
            {card.note.time}
          </span>
        </span>
        <span className="whitespace-nowrap font-display text-[11px] font-medium tracking-[-0.035em] text-[#25272b]">
          {card.note.amount}
        </span>
      </div>
    </div>
  );
}

function CoinIcon({ size }: { size: number }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="9" cy="8" rx="4.5" ry="2.7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4.5 8v4.2c0 1.5 2 2.8 4.5 2.8s4.5-1.3 4.5-2.8V8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <ellipse cx="15.5" cy="13.2" rx="4" ry="2.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M11.5 13.2v3.4c0 1.4 1.8 2.5 4 2.5s4-1.1 4-2.5v-3.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
