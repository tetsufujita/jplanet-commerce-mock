"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 4000;

type CardKind = "resolve" | "book" | "handoff" | "feedback";

type FeatureCard = {
  readonly id: CardKind;
  readonly label: string;
  readonly eyebrow: string;
  readonly blurb: string;
  /** Solid base color of the card surface. */
  readonly color: string;
  /** Darker shade for the rotated spine + ink accents. */
  readonly deep: string;
  /** Tint for the inner white panel chrome. */
  readonly tint: string;
};

const CARDS: readonly FeatureCard[] = [
  {
    id: "resolve",
    label: "Resolve customer issues",
    eyebrow: "Support",
    blurb: "Answer questions and close tickets end-to-end, in any language.",
    color: "#2F7D55",
    deep: "#1E5639",
    tint: "rgba(47,125,85,0.10)",
  },
  {
    id: "book",
    label: "Book appointments",
    eyebrow: "Scheduling",
    blurb: "Find a slot, confirm details, and put it on the calendar.",
    color: "#3D6CA8",
    deep: "#274A77",
    tint: "rgba(61,108,168,0.10)",
  },
  {
    id: "handoff",
    label: "Hand off to a person",
    eyebrow: "Escalation",
    blurb: "Route to the right human with full context, on the right channel.",
    color: "#B0658C",
    deep: "#824464",
    tint: "rgba(176,101,140,0.10)",
  },
  {
    id: "feedback",
    label: "Collect feedback",
    eyebrow: "Insights",
    blurb: "Close the loop with a quick rating and a reason that sticks.",
    color: "#C06A39",
    deep: "#8E4B23",
    tint: "rgba(192,106,57,0.10)",
  },
] as const;

/* ----------------------------- grain overlay ----------------------------- */

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16] mix-blend-soft-light"
    >
      <filter id="sierra-feature-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={2}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#sierra-feature-grain)" />
    </svg>
  );
}

/* ------------------------------ inner mocks ------------------------------ */

type MockProps = { readonly card: FeatureCard; readonly reduce: boolean };

function ResolveMock({ card, reduce }: MockProps) {
  const lines: readonly { from: "user" | "agent"; text: string }[] = [
    { from: "user", text: "My order hasn't shipped yet." },
    { from: "agent", text: "I see it — flagged at the warehouse." },
    { from: "agent", text: "Re-routed. It leaves today." },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {lines.map((line, i) => (
        <motion.div
          key={line.text}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: EASE,
            delay: reduce ? 0 : 0.25 + i * 0.55,
          }}
          className={
            line.from === "user"
              ? "self-start max-w-[78%]"
              : "self-end max-w-[78%]"
          }
        >
          <div
            className="rounded-2xl px-3.5 py-2 text-[12.5px] leading-snug"
            style={
              line.from === "agent"
                ? { background: card.color, color: SIERRA.paper }
                : { background: SIERRA.offwhite, color: SIERRA.ink }
            }
          >
            {line.text}
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: reduce ? 1 : [0, 1, 1, 0] }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 2.4, ease: "linear", repeat: Infinity, delay: 1.9 }
        }
        className="self-start"
      >
        <div
          className="flex items-center gap-1 rounded-2xl px-3 py-2"
          style={{ background: SIERRA.offwhite }}
        >
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: card.deep, opacity: 0.55 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function BookMock({ card, reduce }: MockProps) {
  const slots: readonly string[] = ["9:00", "10:30", "1:15", "3:45"];
  const chosen = 1;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: SIERRA.ink }}>
          Thursday, Jun 12
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ color: card.deep }}
        >
          4 open
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot, i) => {
          const active = i === chosen;
          return (
            <motion.div
              key={slot}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: EASE,
                delay: reduce ? 0 : 0.2 + i * 0.12,
              }}
              className="relative overflow-hidden rounded-lg px-3 py-2 text-[12.5px] font-medium"
              style={{
                background: active ? card.color : SIERRA.offwhite,
                color: active ? SIERRA.paper : SIERRA.ink,
                border: active
                  ? `1px solid ${card.deep}`
                  : "1px solid rgba(48,46,45,0.08)",
              }}
            >
              {slot}
              {active ? (
                <motion.span
                  aria-hidden
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={
                    reduce
                      ? { scale: 1, opacity: 1 }
                      : { scale: [0, 1.15, 1], opacity: [0, 1, 1] }
                  }
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: reduce ? 0 : 0.95,
                    repeat: reduce ? 0 : Infinity,
                    repeatDelay: 2.6,
                  }}
                  className="absolute right-2 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ background: SIERRA.paper }}
                >
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2 5 8.6 9.6 3.4"
                      stroke={card.color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
              ) : null}
            </motion.div>
          );
        })}
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.85 }}
        className="rounded-lg px-3 py-2 text-[12px]"
        style={{ background: card.tint, color: card.deep }}
      >
        Confirmed — invite sent to inbox.
      </motion.div>
    </div>
  );
}

function HandoffMock({ card, reduce }: MockProps) {
  const channels: readonly { name: string; mark: string }[] = [
    { name: "Chat", mark: "C" },
    { name: "Voice", mark: "V" },
    { name: "Email", mark: "@" },
  ];
  const target = 1;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[12.5px]" style={{ color: SIERRA.ink }}>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
          style={{ background: card.color, color: SIERRA.paper }}
        >
          AI
        </span>
        <span className="opacity-60">handing off to</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        {channels.map((ch, i) => {
          const active = i === target;
          return (
            <motion.div
              key={ch.name}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale:
                  reduce || !active ? 1 : [1, 1.06, 1],
              }}
              transition={{
                duration: active && !reduce ? 1.6 : 0.45,
                ease: EASE,
                delay: reduce ? 0 : 0.2 + i * 0.1,
                repeat: active && !reduce ? Infinity : 0,
                repeatDelay: active && !reduce ? 1.4 : 0,
              }}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2.5"
              style={{
                background: active ? card.color : SIERRA.offwhite,
                color: active ? SIERRA.paper : SIERRA.ink,
                border: active
                  ? `1px solid ${card.deep}`
                  : "1px solid rgba(48,46,45,0.08)",
              }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold"
                style={{
                  background: active ? SIERRA.paper : card.tint,
                  color: active ? card.color : card.deep,
                }}
              >
                {ch.mark}
              </span>
              <span className="text-[11px] font-medium">{ch.name}</span>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.8 }}
        className="rounded-lg px-3 py-2 text-[12px]"
        style={{ background: card.tint, color: card.deep }}
      >
        Mara Okonkwo joined — full transcript attached.
      </motion.div>
    </div>
  );
}

function FeedbackMock({ card, reduce }: MockProps) {
  const fill = 0.84;
  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-[12.5px]" style={{ color: SIERRA.ink }}>
        How did we do today?
      </span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((s) => (
          <motion.div
            key={s}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
              ease: EASE,
              delay: reduce ? 0 : 0.2 + s * 0.12,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 17.9 6.4 19.8l1.3-6.3L2.9 9.2l6.4-.7L12 2.6z"
                fill={s <= 3 ? card.color : SIERRA.offwhite}
                stroke={card.deep}
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ))}
      </div>
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: SIERRA.offwhite }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: card.color }}
          initial={reduce ? false : { width: "0%" }}
          animate={{ width: `${fill * 100}%` }}
          transition={{
            duration: reduce ? 0 : 1.6,
            ease: EASE,
            delay: reduce ? 0 : 0.7,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[11.5px]" style={{ color: card.deep }}>
        <span>Customer satisfaction</span>
        <motion.span
          className="font-semibold"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 1.4 }}
        >
          4.6 / 5
        </motion.span>
      </div>
    </div>
  );
}

function CardMock({ card, reduce }: MockProps) {
  switch (card.id) {
    case "resolve":
      return <ResolveMock card={card} reduce={reduce} />;
    case "book":
      return <BookMock card={card} reduce={reduce} />;
    case "handoff":
      return <HandoffMock card={card} reduce={reduce} />;
    case "feedback":
      return <FeedbackMock card={card} reduce={reduce} />;
    default:
      return null;
  }
}

/* ------------------------------ controls ------------------------------ */

type PlayPauseProps = {
  readonly playing: boolean;
  readonly onToggle: () => void;
};

function PlayPauseButton({ playing, onToggle }: PlayPauseProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause auto-advance" : "Play auto-advance"}
      className="group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors"
      style={{
        borderColor: "rgba(48,46,45,0.14)",
        color: SIERRA.ink,
        background: SIERRA.paper,
      }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: SIERRA.forest, color: SIERRA.paper }}
      >
        {playing ? (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
            <rect x="2.5" y="2" width="2.4" height="8" rx="0.6" fill="currentColor" />
            <rect x="7.1" y="2" width="2.4" height="8" rx="0.6" fill="currentColor" />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 2.2 10 6 3 9.8V2.2Z" fill="currentColor" />
          </svg>
        )}
      </span>
      {playing ? "Pause" : "Play"}
    </button>
  );
}

/* ------------------------------ main ------------------------------ */

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function SierraFeatureStage() {
  const reduce = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const autoplay = isPlaying && !reduce;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay]);

  const handleSelect = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: SIERRA.offwhite }}
    >
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        {/* Header */}
        <motion.div
          variants={reduce ? undefined : headerVariants}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <span
            className="font-display text-[12px] font-medium uppercase tracking-[0.18em]"
            style={{ color: SIERRA.forest }}
          >
            One agent, every outcome
          </span>
          <h2
            className="font-display mt-4 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
            style={{ color: SIERRA.ink }}
          >
            Transform your customer experience.
          </h2>
        </motion.div>

        {/* Stage controls */}
        <div className="mt-12 flex items-center justify-between sm:mt-14">
          <div className="flex items-center gap-2" aria-hidden>
            {CARDS.map((card, i) => (
              <span
                key={card.id}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === activeIndex ? 22 : 8,
                  background:
                    i === activeIndex ? SIERRA.forest : "rgba(48,46,45,0.18)",
                }}
              />
            ))}
          </div>
          <PlayPauseButton
            playing={isPlaying}
            onToggle={() => setIsPlaying((p) => !p)}
          />
        </div>

        {/* The stage */}
        <div className="mt-6 flex h-[460px] gap-3 sm:h-[440px]">
          {CARDS.map((card, i) => {
            const active = i === activeIndex;
            return (
              <motion.div
                key={card.id}
                layout
                onClick={active ? undefined : () => handleSelect(i)}
                role={active ? undefined : "button"}
                tabIndex={active ? -1 : 0}
                aria-label={active ? undefined : `Show ${card.label}`}
                onKeyDown={
                  active
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(i);
                        }
                      }
                }
                animate={{ flexGrow: active ? 1 : 0 }}
                transition={{
                  layout: { duration: reduce ? 0 : 0.7, ease: EASE },
                  flexGrow: { duration: reduce ? 0 : 0.7, ease: EASE },
                }}
                className={`relative flex shrink-0 overflow-hidden rounded-[20px] ${
                  active ? "cursor-default" : "cursor-pointer"
                }`}
                style={{
                  flexBasis: active ? "auto" : 76,
                  background: card.color,
                  boxShadow: active
                    ? "0 22px 60px rgba(48,46,45,0.22)"
                    : "0 8px 22px rgba(48,46,45,0.10)",
                }}
              >
                <GrainOverlay />

                <AnimatePresence mode="wait" initial={false}>
                  {active ? (
                    <motion.div
                      key="expanded"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.18 }}
                      className="relative z-10 flex w-full min-w-[260px] flex-col justify-between p-7 sm:p-8"
                    >
                      <div>
                        <span
                          className="font-display inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]"
                          style={{
                            background: "rgba(255,255,255,0.18)",
                            color: SIERRA.paper,
                          }}
                        >
                          {card.eyebrow}
                        </span>
                        <h3
                          className="font-display mt-4 max-w-[16ch] text-balance text-2xl font-medium tracking-[-0.02em] sm:text-[28px]"
                          style={{ color: SIERRA.paper }}
                        >
                          {card.label}
                        </h3>
                        <p
                          className="font-display mt-2.5 max-w-[34ch] text-[14px] leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.82)" }}
                        >
                          {card.blurb}
                        </p>
                      </div>

                      {/* Inner white mock panel */}
                      <motion.div
                        key={card.id}
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          ease: EASE,
                          delay: reduce ? 0 : 0.3,
                        }}
                        className="mt-6 rounded-2xl p-4 sm:p-5"
                        style={{
                          background: SIERRA.paper,
                          boxShadow: "0 12px 30px rgba(48,46,45,0.14)",
                        }}
                      >
                        <CardMock card={card} reduce={reduce} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="spine"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="relative z-10 flex w-full flex-col items-center justify-between py-6"
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{
                          background: "rgba(255,255,255,0.20)",
                          color: SIERRA.paper,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="font-display whitespace-nowrap text-[13px] font-medium tracking-[-0.01em]"
                        style={{
                          color: SIERRA.paper,
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        {card.label}
                      </span>
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ background: "rgba(255,255,255,0.55)" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
