import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

/* ------------------------------------------------------------------ */
/* §3 日本語サポート帯 — .multilingual-support-section の再現           */
/* DOM: stripe-jp-dom.html offset 351,875–357,073                      */
/* motion: 01-motion-spec.md §1(§3)                                    */
/*   - section entrance なし（進入時完成形）                            */
/*   - chat banner = clip + translateY + opacity で吹き出し入替り        */
/*     （周期は P19 未実測 → 3fps 観測からの推定値）                     */
/* ------------------------------------------------------------------ */

const BG_DESKTOP =
  "https://images.stripeassets.com/fzn2n1nzq965/4pgzNLGJpUIMoJXTPNLMW6/ea9e8bb72aeef5ac645a7ad41d2427f6/Mask_group__2_.png";
const BG_MOBILE =
  "https://images.stripeassets.com/fzn2n1nzq965/1eVnXDn2uKF2Ka43laIhhu/4ecb3ba902b71ef5bdabf4ff88dffbe7/Background.png";

/* 本家 DOM の bubble 実寸（multilingual-support-graphic: 424×148） */
const Q_WIDTH = 331; // 質問 bubble（navy、rect 331×44）
const Q_HEIGHT = 44;
const A_WIDTH = 384; // 回答 bubble（white、rect 384×66）
const A_HEIGHT = 66;
const COLLAPSED_WIDTH = 64; // typing 中の pill 幅（推定）

/* ---------------------------- chat phase --------------------------- */

type ChatPhase =
  | "reset"
  | "m1-typing"
  | "m1-shown"
  | "m2-typing"
  | "hold"
  | "exit";

type BubbleState = "hidden" | "typing" | "shown" | "exit";

interface PhaseStep {
  phase: ChatPhase;
  ms: number;
}

/* duration は 3fps storyboard の下限保証なし観測からの推定（P19） */
const PHASE_ORDER: PhaseStep[] = [
  { phase: "reset", ms: 400 },
  { phase: "m1-typing", ms: 1100 },
  { phase: "m1-shown", ms: 700 },
  { phase: "m2-typing", ms: 1100 },
  { phase: "hold", ms: 3200 },
  { phase: "exit", ms: 500 },
];

const FIRST_STEP: PhaseStep = { phase: "reset", ms: 400 };

function useChatPhase(enabled: boolean): ChatPhase {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const step = PHASE_ORDER[index] ?? FIRST_STEP;
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % PHASE_ORDER.length);
    }, step.ms);
    return () => { window.clearTimeout(timer); };
  }, [index, enabled]);

  return (PHASE_ORDER[index] ?? FIRST_STEP).phase;
}

function questionState(phase: ChatPhase): BubbleState {
  switch (phase) {
    case "reset":
      return "hidden";
    case "m1-typing":
      return "typing";
    case "m1-shown":
    case "m2-typing":
    case "hold":
      return "shown";
    case "exit":
      return "exit";
  }
}

function answerState(phase: ChatPhase): BubbleState {
  switch (phase) {
    case "reset":
    case "m1-typing":
    case "m1-shown":
      return "hidden";
    case "m2-typing":
      return "typing";
    case "hold":
      return "shown";
    case "exit":
      return "exit";
  }
}

/* --------------------------- variants ------------------------------ */

const questionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    width: COLLAPSED_WIDTH,
    transition: { duration: 0 },
  },
  typing: {
    opacity: 1,
    y: 0,
    width: COLLAPSED_WIDTH,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  shown: {
    opacity: 1,
    y: 0,
    width: Q_WIDTH,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    width: Q_WIDTH,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

const answerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    width: COLLAPSED_WIDTH,
    height: Q_HEIGHT,
    transition: { duration: 0 },
  },
  typing: {
    opacity: 1,
    y: 0,
    width: COLLAPSED_WIDTH,
    height: Q_HEIGHT,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  shown: {
    opacity: 1,
    y: 0,
    width: A_WIDTH,
    height: A_HEIGHT,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    width: A_WIDTH,
    height: A_HEIGHT,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

/* ----------------------------- parts ------------------------------- */

/* 全 CTA 共通の hover arrow（hds-icon-hover-arrow 再現: 軸線 fade-in + くの字 shift） */
function HoverArrow() {
  return (
    <svg
      className="ml-2 shrink-0"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        className="opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        d="M0.5 5.5h7"
      />
      <path
        className="transition-transform duration-200 ease-out group-hover:translate-x-[1.5px]"
        d="M1.5 1.5l4 4-4 4"
      />
    </svg>
  );
}

function TypingDots({ color, visible }: { color: string; visible: boolean }) {
  return (
    <span
      className="flex items-center gap-[3px] transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-[5px] w-[5px] rounded-full"
          style={{ backgroundColor: color }}
          animate={visible ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.25 }}
          transition={
            visible
              ? {
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }
              : { duration: 0.1 }
          }
        />
      ))}
    </span>
  );
}

/* --------------------------- component ----------------------------- */

export function SjSupport() {
  const reduceMotion = useReducedMotion();
  const phase = useChatPhase(!reduceMotion);

  const m1: BubbleState = reduceMotion ? "shown" : questionState(phase);
  const m2: BubbleState = reduceMotion ? "shown" : answerState(phase);

  const m1TextVisible = m1 === "shown" || m1 === "exit";
  const m2TextVisible = m2 === "shown" || m2 === "exit";

  return (
    <section className="bg-white py-[80px]">
      <div className="mx-auto max-w-[1264px] px-4">
        <div className="relative min-h-[400px] overflow-hidden rounded-lg">
          {/* 背景グラデ画像（本家 picture ×2: PC / mobile） */}
          <picture aria-hidden="true">
            <source
              media="(min-width: 768px)"
              srcSet={`${BG_DESKTOP}?w=768&fm=webp&q=90 1x, ${BG_DESKTOP}?w=1536&fm=webp&q=90 2x`}
            />
            <img
              loading="lazy"
              alt=""
              src={`${BG_MOBILE}?w=768&fm=webp&q=90`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>

          {/* テキスト + CTA */}
          <div className="relative z-10 flex min-h-[400px] flex-col px-8 py-8 md:px-11 lg:pr-[500px]">
            <div className="max-w-[536px] text-[20px] leading-[1.6] tracking-[-0.2px] md:text-[24px] md:leading-[1.25]">
              <h3 className="inline font-semibold text-[#0a2540]">
                専門スタッフによる包括的な日本語サポート。
              </h3>
              <wbr />{" "}
              <p className="inline font-semibold text-[#596171]">
                お困りの際は、Stripe
                のサポートページをご活用ください。よくあるご質問 (FAQ)
                を確認できるほか、専門スタッフにサポートも受けられます。
              </p>
            </div>
            <div className="mt-9">
              <a
                className="group inline-flex items-center rounded-full bg-white px-4 py-[6px] text-[15px] font-semibold text-[var(--sj-blurple)] shadow-[0_2px_5px_rgba(15,23,42,0.16)] transition-colors duration-200 hover:text-[var(--sj-blurple-dark)]"
                href="https://support.stripe.com/?locale=ja-JP"
              >
                サポートにお問い合わせ
                <HoverArrow />
              </a>
            </div>
          </div>

          {/* chat banner graphic（dom-graphic 424×148。lg 以上のみ） */}
          <div
            className="pointer-events-none absolute right-[127px] top-[126px] z-10 hidden w-[424px] lg:block"
            role="img"
            aria-label="日本語サポートのチャット例"
          >
            <div
              className="flex flex-col gap-4"
              aria-hidden="true"
            >
              {/* 質問 bubble（navy 331×44、右寄せ） */}
              <motion.div
                className="relative self-end overflow-hidden rounded-[4px] bg-[#1f1c4d]"
                style={{ height: Q_HEIGHT }}
                variants={questionVariants}
                initial={reduceMotion ? "shown" : "hidden"}
                animate={m1}
              >
                <span
                  className="absolute inset-y-0 right-0 flex items-center whitespace-nowrap px-4 text-[14px] text-white transition-opacity duration-300"
                  style={{
                    width: Q_WIDTH,
                    opacity: m1TextVisible ? 1 : 0,
                    transitionDelay: m1TextVisible ? "150ms" : "0ms",
                  }}
                >
                  購入者に返金する方法を教えてください。
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center justify-center"
                  style={{ width: COLLAPSED_WIDTH }}
                >
                  <TypingDots color="#ffffff" visible={m1 === "typing"} />
                </span>
              </motion.div>

              {/* 回答 bubble（white 384×66、左寄せ） */}
              <motion.div
                className="relative self-start overflow-hidden rounded-[4px] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.12)]"
                variants={answerVariants}
                initial={reduceMotion ? "shown" : "hidden"}
                animate={m2}
              >
                <span
                  className="absolute inset-y-0 left-0 flex items-center px-4 text-[13.5px] leading-[1.55] text-[#0a2540] transition-opacity duration-300"
                  style={{
                    width: A_WIDTH,
                    opacity: m2TextVisible ? 1 : 0,
                    transitionDelay: m2TextVisible ? "150ms" : "0ms",
                  }}
                >
                  ダッシュボードまたは API
                  経由で返金することができます。手順をご紹介します。
                </span>
                <span
                  className="absolute inset-y-0 left-0 flex items-center justify-center"
                  style={{ width: COLLAPSED_WIDTH }}
                >
                  <TypingDots color="#7a85a0" visible={m2 === "typing"} />
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
