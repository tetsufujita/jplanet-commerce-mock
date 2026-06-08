"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";

import { Reveal } from "@/components/motion/Reveal";

import type { SectionProps } from "./_kit";

const LOGO_KEYS = [
  "logo1",
  "logo2",
  "logo3",
  "logo4",
  "logo5",
  "logo6",
  "logo7",
  "logo8",
] as const;

const CARD_KEYS = ["team", "channels", "outcomes"] as const;

const HOTEL_THUMBNAIL = "/images/portrait-cafe.jpg";

const TEAM_AVATARS = [
  { src: "/images/team-avatars/avatar-1.png" },
  { src: "/images/team-avatars/avatar-2.png" },
  { src: "/images/team-avatars/avatar-3.png" },
  { src: "/images/team-avatars/avatar-4.png" },
  { src: "/images/team-avatars/avatar-5.png" },
  { src: "/images/team-avatars/avatar-6.png" },
  { src: "/images/team-avatars/avatar-7.png" },
  { src: "/images/team-avatars/avatar-8.png" },
] as const;

const TEAM_SLOTS = [
  { x: "50%", y: "8%" },
  { x: "68%", y: "17%" },
  { x: "80%", y: "43%" },
  { x: "68%", y: "69%" },
  { x: "50%", y: "82%" },
  { x: "32%", y: "69%" },
  { x: "20%", y: "43%" },
  { x: "32%", y: "17%" },
] as const;

const TEAM_RING_ORDERS = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [5, 6, 7, 0, 1, 2, 3, 4],
] as const;

type NumberTranslator = ReturnType<typeof useTranslations>;

export function Numbers(_props: SectionProps) {
  const t = useTranslations("home.numbers");
  const [paused, setPaused] = useState(false);

  return (
    <section className="relative isolate overflow-hidden bg-andes-paper text-andes-ink">
      <ProductMotionStyles />

      <div className="px-5 pt-16 pb-16 sm:px-8 sm:pt-20 lg:px-0 lg:pt-24">
        <Reveal y={16}>
          <h2 className="mx-auto max-w-3xl text-center font-display text-[clamp(2.35rem,3.3vw,3.95rem)] font-light leading-[1.08] tracking-[-0.04em] text-andes-ink">
            {t("experienceTitle")}
          </h2>
        </Reveal>

        <Reveal y={14}>
          <p className="mx-auto mt-8 max-w-4xl text-center font-display text-[clamp(1.05rem,1.25vw,1.35rem)] font-light leading-snug tracking-[-0.02em] text-gray-500">
            {t("introLine")}
          </p>
        </Reveal>

        <div className="mx-auto mt-[72px] w-full max-w-[1410px] lg:w-[72vw]">
          <Reveal y={18}>
            <ProductExperienceCard
              paused={paused}
              t={t}
              onToggle={() => {
                setPaused((current) => !current);
              }}
            />
          </Reveal>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {CARD_KEYS.map((key, index) => (
              <Reveal key={key} delay={0.12 + index * 0.08}>
                <FeatureTile tone={key} title={t(`${key}Title`)} body={t(`${key}Body`)} />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1} className="mt-16">
          <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-10 gap-y-9 text-center sm:grid-cols-4">
            {LOGO_KEYS.map((key) => (
              <li
                key={key}
                className="font-display text-[17px] font-semibold tracking-[-0.02em] text-gray-300 grayscale"
              >
                {t(key)}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.14} className="mx-auto mt-20 max-w-3xl text-center">
          <h2 className="text-balance font-display text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.045em]">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-gray-500 sm:text-base">
            {t("lead")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ProductExperienceCard({
  onToggle,
  paused,
  t,
}: {
  onToggle: () => void;
  paused: boolean;
  t: NumberTranslator;
}) {
  return (
    <article
      className="andes-product-scene group relative min-h-[600px] overflow-hidden rounded-[18px] bg-[linear-gradient(110deg,var(--color-andes-khaki),var(--color-andes-forest))] p-8 text-andes-paper sm:min-h-[630px] sm:p-10 lg:p-12"
      data-paused={paused ? "true" : "false"}
    >
      <ProductBackdrop t={t} />

      <button
        aria-label={paused ? t("playAnimation") : t("pauseAnimation")}
        className="product-control absolute right-5 top-11 z-20 grid h-12 w-12 place-items-center rounded-full bg-andes-paper text-andes-ink opacity-0 shadow-[0_18px_44px_rgba(6,11,31,0.16)] transition duration-300 ease-andes hover:scale-105 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-andes-paper group-hover:opacity-100 sm:right-8"
        type="button"
        onClick={onToggle}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>

      <div className="relative z-10 flex min-h-[calc(600px-4rem)] flex-col sm:min-h-[calc(630px-5rem)]">
        <h3 className="max-w-[38rem] font-display text-[clamp(1.65rem,2.35vw,2.15rem)] font-light leading-[1.16] tracking-[-0.035em] text-andes-paper">
          {t("featureTitle")}
        </h3>

        <div className="product-motion agent-bubble absolute left-1/2 top-[55%] w-[min(92%,580px)] rounded-[28px] border border-andes-paper/22 bg-andes-paper/[0.07] px-7 py-5 shadow-[0_24px_70px_rgba(6,11,31,0.08)] backdrop-blur-[2px] sm:px-8 sm:py-6">
          <p className="flex items-center gap-3 font-display text-[20px] font-light tracking-[-0.02em] text-andes-paper/80">
            <AgentMark />
            {t("agentLabel")}
          </p>
          <p className="mt-4 font-display text-[clamp(1.25rem,1.65vw,1.55rem)] font-light leading-snug tracking-[-0.035em] text-andes-paper">
            {t("agentMessage")}
          </p>
        </div>

        <p className="mt-auto max-w-[34rem] text-[clamp(1.05rem,1.45vw,1.35rem)] font-light leading-relaxed text-andes-paper">
          {t("featureBody")}
        </p>
      </div>
    </article>
  );
}

function ProductBackdrop({ t }: { t: NumberTranslator }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_34%,rgba(250,250,247,0.18),transparent_29%),radial-gradient(circle_at_82%_14%,rgba(250,250,247,0.11),transparent_30%),linear-gradient(90deg,rgba(250,250,247,0.02),transparent_42%,rgba(6,11,31,0.08))]" />

      <DeliveryGhost t={t} />
      <HotelGhost t={t} />
      <BudgetGhost t={t} />
      <OrderGhost t={t} />
      <SubscriptionGhost t={t} />
      <EtaGhost t={t} />
    </div>
  );
}

function DeliveryGhost({ t }: { t: NumberTranslator }) {
  return (
    <div className="product-motion product-ghost absolute -left-28 -top-16 h-[250px] w-[620px] rounded-[28px] border border-andes-paper/12 bg-andes-paper/[0.025] p-8 text-andes-paper/42 [--alpha:0.34] [--delay:0.15s] [--from-x:-34px] [--from-y:-18px]">
      <p className="font-display text-[17px] font-light">{t("ghostDelivery")}</p>
      <div className="mt-7 h-11 rounded-lg border border-andes-paper/12">
        <div className="h-full w-[43%] rounded-lg bg-andes-paper/10" />
      </div>
      <div className="mt-4 flex justify-between text-sm">
        <span>{t("ghostTimelineStart")}</span>
        <span>{t("ghostTimelineEnd")}</span>
      </div>
    </div>
  );
}

function HotelGhost({ t }: { t: NumberTranslator }) {
  return (
    <div className="product-motion product-ghost absolute left-[37%] -top-12 h-[230px] w-[485px] rounded-[28px] border border-andes-paper/16 bg-andes-paper/[0.026] p-8 text-andes-paper/52 [--alpha:0.44] [--delay:0.55s] [--from-y:-28px]">
      <p className="font-display text-[20px] font-semibold text-andes-paper/76">{t("ghostHotel")}</p>
      <div className="mt-8 grid grid-cols-[1fr_1fr_auto] gap-7">
        <div className="border-l border-andes-paper/22 pl-4">
          <p className="text-sm text-andes-paper/48">{t("ghostCheckIn")}</p>
          <p className="mt-2 text-base leading-tight text-andes-paper/72">{t("ghostCheckInValue")}</p>
        </div>
        <div className="border-l border-andes-paper/22 pl-4">
          <p className="text-sm text-andes-paper/48">{t("ghostCheckOut")}</p>
          <p className="mt-2 text-base leading-tight text-andes-paper/72">{t("ghostCheckOutValue")}</p>
        </div>
        <span className="relative mt-1 h-[76px] w-[112px] overflow-hidden rounded-lg bg-andes-paper/10 opacity-90">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="112px"
            src={HOTEL_THUMBNAIL}
          />
        </span>
      </div>
    </div>
  );
}

function BudgetGhost({ t }: { t: NumberTranslator }) {
  return (
    <div className="product-motion product-ghost absolute -right-16 -top-20 h-[410px] w-[410px] rounded-[30px] border border-andes-paper/17 bg-andes-paper/[0.028] p-9 text-andes-paper/54 [--alpha:0.48] [--delay:0.75s] [--from-x:38px] [--from-y:-16px]">
      <BudgetGauge />
      <div className="mt-8 space-y-6">
        <ProgressLine label={t("ghostDining")} meta={t("ghostDiningMeta")} percent="43%" width="43%" />
        <ProgressLine label={t("ghostEverything")} meta={t("ghostEverythingMeta")} percent="26.9%" width="27%" />
      </div>
    </div>
  );
}

function OrderGhost({ t }: { t: NumberTranslator }) {
  return (
    <div className="product-motion product-ghost absolute -left-16 bottom-[178px] h-[210px] w-[400px] rounded-[28px] border border-andes-paper/13 bg-andes-paper/[0.025] p-8 text-andes-paper/38 [--alpha:0.32] [--delay:1.05s] [--from-x:-28px] [--from-y:16px]">
      <p className="font-display text-[18px] font-light">{t("ghostOrderSecured")}</p>
      <p className="mt-12 text-[22px] font-light">{t("ghostOrderDate")}</p>
      <p className="mt-16 text-right text-[17px] font-light">{t("ghostTrackOrder")} ›</p>
    </div>
  );
}

function SubscriptionGhost({ t }: { t: NumberTranslator }) {
  return (
    <div className="product-motion product-ghost absolute bottom-[-30px] left-[30%] h-[225px] w-[475px] rounded-[28px] border border-andes-paper/13 bg-andes-paper/[0.026] p-8 text-andes-paper/42 [--alpha:0.34] [--delay:1.25s] [--from-y:26px]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[24px] font-light">{t("ghostSubscriptions")}</p>
        <p className="text-base">{t("ghostManage")} ›</p>
      </div>
      <p className="mt-16 text-[17px]">{t("ghostRenewal")}</p>
      <p className="mt-3 flex items-center gap-2 text-[18px]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-andes-paper/14 text-[12px]">✓</span>
        {t("ghostUnlocked")}
      </p>
    </div>
  );
}

function EtaGhost({ t }: { t: NumberTranslator }) {
  return (
    <div className="product-motion product-ghost absolute bottom-[50px] right-[8%] h-[126px] w-[320px] rounded-[16px] bg-andes-paper/[0.065] p-5 text-andes-paper/44 [--alpha:0.45] [--delay:1.45s] [--from-x:28px] [--from-y:20px]">
      <p className="text-sm">{t("ghostEtaLabel")}</p>
      <p className="mt-3 font-display text-[23px] font-light">{t("ghostEtaValue")}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-andes-paper/20">
          <TruckIcon />
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-andes-paper/10">
          <div className="product-motion progress-fill h-full rounded-full bg-andes-paper/24" />
        </div>
      </div>
    </div>
  );
}

function ProgressLine({
  label,
  meta,
  percent,
  width,
}: {
  label: string;
  meta: string;
  percent: string;
  width: string;
}) {
  return (
    <div>
      <p className="text-sm">{label}</p>
      <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-andes-paper/13">
        <div className="product-motion progress-fill h-full rounded-full bg-andes-paper/82" style={{ width }} />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span>{percent}</span>
        <span>{meta}</span>
      </div>
    </div>
  );
}

function BudgetGauge() {
  return (
    <div className="relative mx-auto h-28 w-28">
      <svg aria-hidden className="h-full w-full -rotate-90 text-andes-paper/22" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="51" stroke="currentColor" strokeWidth="8" />
        <circle
          className="product-motion gauge-ring text-andes-paper"
          cx="60"
          cy="60"
          r="51"
          stroke="currentColor"
          strokeDasharray="320"
          strokeDashoffset="250"
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <p className="font-display text-[26px] font-semibold">$760</p>
        <p className="-mt-1 text-sm">25%</p>
      </div>
    </div>
  );
}

function FeatureTile({ tone, title, body }: { tone: (typeof CARD_KEYS)[number]; title: string; body: string }) {
  const background = {
    team: "bg-[radial-gradient(circle_at_74%_17%,color-mix(in_oklab,var(--color-andes-paper)_14%,transparent),transparent_24%),linear-gradient(135deg,color-mix(in_oklab,var(--color-andes-indigo)_84%,var(--color-andes-navy)),color-mix(in_oklab,var(--color-andes-indigo)_62%,var(--color-andes-teal)))]",
    channels:
      "bg-[radial-gradient(circle_at_72%_18%,rgba(250,250,247,0.13),transparent_24%),linear-gradient(135deg,var(--color-andes-purple),var(--color-andes-glow))]",
    outcomes:
      "bg-[radial-gradient(circle_at_72%_18%,rgba(250,250,247,0.14),transparent_24%),linear-gradient(135deg,var(--color-andes-sunset),var(--color-andes-crimson))]",
  }[tone];

  return (
    <article className={`relative min-h-[430px] overflow-hidden rounded-[14px] p-7 text-white sm:min-h-[490px] sm:p-8 ${background}`}>
      <h3 className="relative z-10 max-w-xs font-display text-[clamp(1.25rem,2vw,1.65rem)] font-medium leading-tight tracking-[-0.025em]">
        {title}
      </h3>
      <div className="pointer-events-none absolute inset-x-0 top-[27%] flex justify-center">
        {tone === "team" ? <TeamOrbit /> : null}
        {tone === "channels" ? <ChannelGrid /> : null}
        {tone === "outcomes" ? <OutcomeHearts /> : null}
      </div>
      <p className="absolute inset-x-7 bottom-8 z-10 max-w-[21rem] text-[14px] leading-relaxed text-white/88 sm:inset-x-8 sm:bottom-10 sm:text-[15px]">
        {body}
      </p>
    </article>
  );
}

function AgentMark() {
  return (
    <svg aria-hidden className="h-7 w-7 shrink-0" viewBox="0 0 24 24" fill="none">
      <g stroke="currentColor" strokeWidth="1.35">
        <circle cx="12" cy="6.9" r="3.2" />
        <circle cx="16.45" cy="9.45" r="3.2" />
        <circle cx="16.45" cy="14.55" r="3.2" />
        <circle cx="12" cy="17.1" r="3.2" />
        <circle cx="7.55" cy="14.55" r="3.2" />
        <circle cx="7.55" cy="9.45" r="3.2" />
      </g>
      <circle cx="12" cy="12" r="2.35" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2.5" width="3.8" height="11" rx="1" />
      <rect x="9.2" y="2.5" width="3.8" height="11" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden className="ml-0.5 h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.2 2.8v10.4c0 .8.9 1.2 1.5.8l8-5.2c.6-.4.6-1.2 0-1.6l-8-5.2c-.6-.4-1.5 0-1.5.8z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h6A1.5 1.5 0 0 1 11 4.5V6h1.5l2 2.4v3.1H13a1.7 1.7 0 0 1-3.2 0H6.2a1.7 1.7 0 0 1-3.2 0H2v-7Zm9 2.8v2.2h2.7L12.5 7.3H11Z" />
    </svg>
  );
}

function TeamOrbit() {
  return (
    <div className="team-orbit relative h-[13rem] w-[14.25rem] max-w-full min-[1800px]:h-[15rem] min-[1800px]:w-[16.5rem]">
      <div className="team-core absolute left-1/2 top-1/2 grid h-[4.25rem] w-[4.25rem] place-items-center rounded-full bg-white/14 text-white ring-1 ring-white/28 min-[1800px]:h-20 min-[1800px]:w-20">
        <AgentMark />
      </div>

      <div className="team-ghost-ring absolute inset-0">
        {TEAM_SLOTS.map((slot) => (
          <span
            key={`${slot.x}-${slot.y}`}
            className="team-slot team-ghost-slot"
            style={{ "--slot-x": slot.x, "--slot-y": slot.y } as CSSProperties}
          />
        ))}
      </div>

      {TEAM_RING_ORDERS.map((order, ringIndex) => (
        <div
          key={ringIndex === 0 ? "team-ring-a" : "team-ring-b"}
          className={`team-face-ring ${ringIndex === 0 ? "team-face-ring-a" : "team-face-ring-b"} absolute inset-0`}
        >
          {order.map((avatarIndex, slotIndex) => {
            const slot = TEAM_SLOTS[slotIndex];
            const avatar = TEAM_AVATARS[avatarIndex];

            if (!slot || !avatar) {
              return null;
            }

            return (
              <span
                key={`${ringIndex}-${avatar.src}-${slot.x}-${slot.y}`}
                className="team-slot team-face-slot"
                style={{ "--slot-x": slot.x, "--slot-y": slot.y } as CSSProperties}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="56px"
                  src={avatar.src}
                />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ChannelGrid() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {["voice", "chat", "mail", "support", "code", "agent"].map((name) => (
        <span
          key={name}
          className="grid h-16 w-16 place-items-center rounded-lg border border-white/18 bg-white/10 text-white/86 backdrop-blur-sm"
        >
          <ChannelIcon name={name} />
        </span>
      ))}
    </div>
  );
}

function ChannelIcon({ name }: { name: string }) {
  if (name === "chat") {
    return (
      <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M5 6h14v10H9l-4 3V6z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16v11H4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="m4 8 8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "code") {
    return (
      <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="m9 7-4 5 4 5M15 7l4 5-4 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "support") {
    return (
      <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M6 13v-2a6 6 0 0 1 12 0v2M6 13h3v5H6zM15 13h3v5h-3z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "agent") return <AgentMark />;
  return (
    <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path d="M6 14v-4M10 17V7M14 15V9M18 13v-2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function OutcomeHearts() {
  return (
    <div className="relative h-48 w-64">
      <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/14 text-white ring-1 ring-white/18">
        <HeartIcon className="h-7 w-7" />
      </span>
      <HeartIcon className="absolute left-[24%] top-[18%] h-5 w-5 text-white/75" />
      <HeartIcon className="absolute right-[22%] top-[33%] h-5 w-5 text-white/75" />
      <HeartIcon className="absolute bottom-[18%] left-[36%] h-4 w-4 text-white/58" />
      <HeartIcon className="absolute bottom-[23%] right-[35%] h-4 w-4 text-white/58" />
    </div>
  );
}

function HeartIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20.2c-4.9-3.6-8-6.6-8-10.1A4.1 4.1 0 0 1 8.1 6c1.6 0 2.8.8 3.9 2.1C13.1 6.8 14.3 6 15.9 6A4.1 4.1 0 0 1 20 10.1c0 3.5-3.1 6.5-8 10.1z" />
    </svg>
  );
}

function ProductMotionStyles() {
  return (
    <style>{`
      .andes-product-scene[data-paused="true"] .product-motion {
        animation-play-state: paused !important;
      }

      .product-ghost {
        animation: andes-ghost-cycle 8.4s var(--ease-andes) infinite both;
        animation-delay: calc(var(--delay, 0s) + 1s);
        opacity: 0;
        transform: translate3d(var(--from-x, 0), var(--from-y, 18px), 0) scale(0.985);
        will-change: opacity, transform;
      }

      .agent-bubble {
        animation: andes-agent-breathe 8.4s var(--ease-andes) infinite both;
        transform: translate3d(-50%, -50%, 0);
        will-change: transform, opacity;
      }

      .progress-fill {
        animation: andes-progress-fill 8.4s var(--ease-andes) infinite both;
        transform-origin: left center;
        will-change: transform;
      }

      .gauge-ring {
        animation: andes-gauge-draw 8.4s var(--ease-andes) infinite both;
        will-change: stroke-dashoffset;
      }

      .team-core {
        animation: andes-team-core 14.4s var(--ease-andes) infinite both;
        will-change: transform, opacity;
      }

      .team-slot {
        --team-avatar-size: 2.72rem;
        position: absolute;
        left: var(--slot-x);
        top: var(--slot-y);
        height: var(--team-avatar-size);
        width: var(--team-avatar-size);
        border-radius: 9999px;
        transform: translate3d(-50%, -50%, 0);
      }

      .team-ghost-slot {
        background: color-mix(in oklab, var(--color-andes-paper) 14%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-andes-paper) 20%, transparent);
      }

      .team-face-slot {
        overflow: hidden;
        background: color-mix(in oklab, var(--color-andes-paper) 18%, transparent);
        box-shadow:
          inset 0 0 0 1px color-mix(in oklab, var(--color-andes-paper) 28%, transparent),
          0 10px 22px rgba(6, 11, 31, 0.12);
      }

      .team-ghost-ring {
        animation: andes-team-ghost-ring 14.4s var(--ease-andes) infinite both;
        will-change: opacity, transform, filter;
      }

      .team-face-ring {
        will-change: opacity, transform, filter;
      }

      .team-face-ring-a {
        animation: andes-team-face-a 14.4s var(--ease-andes) infinite both;
      }

      .team-face-ring-b {
        animation: andes-team-face-b 14.4s var(--ease-andes) infinite both;
      }

      @keyframes andes-ghost-cycle {
        0%, 8%, 68%, 100% {
          opacity: 0;
          transform: translate3d(var(--from-x, 0), var(--from-y, 18px), 0) scale(0.985);
        }
        18%, 54% {
          opacity: var(--alpha, 0.34);
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @keyframes andes-agent-breathe {
        0%, 100% {
          opacity: 0.96;
          transform: translate3d(-50%, -50%, 0) scale(1);
        }
        22%, 56% {
          opacity: 0.88;
          transform: translate3d(-50%, calc(-50% + 3px), 0) scale(0.995);
        }
      }

      @keyframes andes-progress-fill {
        0%, 12%, 100% {
          transform: scaleX(0.16);
        }
        42%, 62% {
          transform: scaleX(1);
        }
      }

      @keyframes andes-gauge-draw {
        0%, 12%, 100% {
          stroke-dashoffset: 285;
        }
        42%, 62% {
          stroke-dashoffset: 172;
        }
      }

      @keyframes andes-team-core {
        0%, 100% {
          opacity: 0.92;
          transform: translate3d(-50%, -50%, 0) scale(1);
        }
        22%, 48%, 90%, 96% {
          opacity: 0.76;
          transform: translate3d(-50%, -50%, 0) scale(1.045);
        }
        56%, 82% {
          opacity: 0.92;
          transform: translate3d(-50%, -50%, 0) scale(1);
        }
      }

      @keyframes andes-team-ghost-ring {
        0%, 14%, 54%, 84%, 100% {
          opacity: 0;
          transform: scale(0.94);
          filter: blur(1px);
        }
        22%, 48%, 90%, 96% {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
      }

      @keyframes andes-team-face-a {
        0%, 12%, 100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
        20%, 94% {
          opacity: 0;
          transform: translate3d(0, 4px, 0) scale(0.965);
          filter: blur(2px);
        }
        98% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes andes-team-face-b {
        0%, 50% {
          opacity: 0;
          transform: translate3d(0, -4px, 0) scale(0.965);
          filter: blur(2px);
        }
        56%, 82% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
        90%, 100% {
          opacity: 0;
          transform: translate3d(0, 4px, 0) scale(0.965);
          filter: blur(2px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .product-ghost {
          animation: none !important;
          opacity: var(--alpha, 0.34) !important;
          transform: none !important;
        }

        .agent-bubble,
        .progress-fill,
        .gauge-ring,
        .team-core,
        .team-ghost-ring,
        .team-face-ring {
          animation: none !important;
        }

        .team-ghost-ring,
        .team-face-ring-b {
          opacity: 0 !important;
        }

        .team-face-ring-a {
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
        }
      }
    `}</style>
  );
}
