"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/routing";

// useLayoutEffect warns during SSR; the chat only animates on the client.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = { locale: Locale };

type Product = { name: string; spec: string; price: string };
type OrderRow = { label: string; value: string; dim?: boolean };

type ChatMessage =
  | { id: string; type: "user-text"; text: string; time: string }
  | { id: string; type: "agent-products"; text: string; products: Product[]; time: string }
  | { id: string; type: "agent-order"; title: string; rows: OrderRow[]; total: string; time: string };

type Scenario = { id: string; user: string; messages: ChatMessage[] };

const INK = "#0A1428";
const MUTED = "#626a7a";
const GREEN = "#0E9F6E";
const USER_BG = "#D7F4E4";

const SCENARIOS: Scenario[] = [
  {
    id: "creme",
    user: "Anna",
    messages: [
      { id: "creme-1", type: "user-text", text: "Oi! Quero comprar um creme facial japonês, minha pele anda meio ressecada", time: "17:54" },
      {
        id: "creme-2",
        type: "agent-products",
        text: "Oi Anna 😊 Pra pele seca, esses três são os mais pedidos esse mês",
        products: [
          { name: "J-Beauty Hydrating Cream", spec: "50ml", price: "R$ 245" },
          { name: "J-Beauty Hydrating Cream", spec: "100ml", price: "R$ 420" },
          { name: "J-Beauty Premium Anti-Age", spec: "50ml", price: "R$ 380" },
        ],
        time: "17:55",
      },
      { id: "creme-3", type: "user-text", text: "Como é minha primeira vez, fico com o de 50ml mesmo", time: "17:55" },
      {
        id: "creme-4",
        type: "agent-order",
        title: "Pedido confirmado · chega em 4–7 dias",
        rows: [
          { label: "Produto", value: "R$ 245,00" },
          { label: "Frete", value: "R$ 89,00" },
          { label: "Subtotal CIF", value: "R$ 334,00" },
          { label: "II (60%)", value: "R$ 200,40" },
          { label: "Dedução", value: "-R$ 20,00", dim: true },
        ],
        total: "R$ 514,40",
        time: "17:56",
      },
    ],
  },
  {
    id: "toner",
    user: "Marina",
    messages: [
      { id: "toner-1", type: "user-text", text: "Oi! Tem toner japonês? Minha pele é sensível", time: "10:12" },
      {
        id: "toner-2",
        type: "agent-products",
        text: "Oi Marina! Esses funcionam super bem pra pele sensível 🌸",
        products: [
          { name: "Hydrating Toner", spec: "150ml", price: "R$ 189" },
          { name: "Calming Toner", spec: "200ml", price: "R$ 245" },
          { name: "Premium Toner Kit", spec: "3-pack", price: "R$ 540" },
        ],
        time: "10:13",
      },
      { id: "toner-3", type: "user-text", text: "Adoro kit, vou no de 3-pack", time: "10:14" },
      {
        id: "toner-4",
        type: "agent-order",
        title: "Boa escolha! Pedido confirmado",
        rows: [
          { label: "Produto", value: "R$ 540,00" },
          { label: "Frete", value: "R$ 120,00" },
          { label: "Subtotal CIF", value: "R$ 660,00" },
          { label: "II (60%)", value: "R$ 396,00" },
        ],
        total: "R$ 1.056,00",
        time: "10:14",
      },
    ],
  },
  {
    id: "stationery",
    user: "Carlos",
    messages: [
      { id: "stat-1", type: "user-text", text: "E aí, tem caneta japonesa boa? Pilot, Sakura, essas marcas", time: "14:32" },
      {
        id: "stat-2",
        type: "agent-products",
        text: "Tenho sim Carlos! Essas são as mais procuradas pra escrita 🖊️",
        products: [
          { name: "Caneta Tinteiro Premium", spec: "fine nib", price: "R$ 380" },
          { name: "Caneta Gel Ponta Fina", spec: "set 12", price: "R$ 145" },
          { name: "Lápis Mecânico Precisão", spec: "0.5mm", price: "R$ 95" },
        ],
        time: "14:33",
      },
      { id: "stat-3", type: "user-text", text: "Vou de tinteiro, uso pro trabalho mesmo", time: "14:34" },
      {
        id: "stat-4",
        type: "agent-order",
        title: "Show! Pedido confirmado",
        rows: [
          { label: "Produto", value: "R$ 380,00" },
          { label: "Frete", value: "R$ 65,00" },
          { label: "Subtotal CIF", value: "R$ 445,00" },
          { label: "II (60%)", value: "R$ 267,00" },
        ],
        total: "R$ 712,00",
        time: "14:34",
      },
    ],
  },
  {
    id: "anime",
    user: "Júlia",
    messages: [
      { id: "ani-1", type: "user-text", text: "Oi! Procuro chaveiro de anime, chegou alguma novidade?", time: "20:08" },
      {
        id: "ani-2",
        type: "agent-products",
        text: "Oi Júlia! Acabou de chegar essas 3 opções 🎌",
        products: [
          { name: "Chaveiro Acrílico", spec: "unidade", price: "R$ 45" },
          { name: "Pelúcia Mini Personagem", spec: "10cm", price: "R$ 89" },
          { name: "Set Colecionável", spec: "5 un", price: "R$ 220" },
        ],
        time: "20:09",
      },
      { id: "ani-3", type: "user-text", text: "Quero a pelúcia mini, super fofo!", time: "20:09" },
      {
        id: "ani-4",
        type: "agent-order",
        title: "Fechado! Pedido confirmado, chega rapidinho",
        rows: [
          { label: "Produto", value: "R$ 89,00" },
          { label: "Frete", value: "R$ 45,00" },
          { label: "Subtotal CIF", value: "R$ 134,00" },
          { label: "II (60%)", value: "R$ 80,40" },
        ],
        total: "R$ 214,40",
        time: "20:10",
      },
    ],
  },
];

const MESSAGE_STAGGER_MS = 1600;
const SCENARIO_HOLD_MS = 4000;
const FADE_OUT_MS = 600;

export function HeroV4({ locale }: Props) {
  const t = useTranslations("v4.hero");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [scenarioVisible, setScenarioVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  // Ceiling: lock the chat window to the height of the first three bubbles.
  const [maskHeight, setMaskHeight] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const scenario = SCENARIOS[scenarioIdx];
    if (!scenario) return;

    const total = scenario.messages.length;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    setVisibleCount(0);
    setScenarioVisible(true);

    for (let i = 1; i <= total; i++) {
      timeouts.push(setTimeout(() => setVisibleCount(i), i * MESSAGE_STAGGER_MS));
    }
    timeouts.push(setTimeout(() => setScenarioVisible(false), total * MESSAGE_STAGGER_MS + SCENARIO_HOLD_MS));
    timeouts.push(
      setTimeout(
        () => setScenarioIdx((p) => (p + 1) % SCENARIOS.length),
        total * MESSAGE_STAGGER_MS + SCENARIO_HOLD_MS + FADE_OUT_MS
      )
    );

    return () => timeouts.forEach(clearTimeout);
  }, [scenarioIdx]);

  useIsomorphicLayoutEffect(() => {
    const col = columnRef.current;
    const prev = prevCountRef.current;
    prevCountRef.current = visibleCount;

    if (!col) return;

    const gap = parseFloat(getComputedStyle(col).rowGap || "0") || 0;

    const kids = Array.from(col.children) as HTMLElement[];
    if (kids.length >= 3) {
      const firstThree = kids.slice(0, 3);
      const ceiling =
        firstThree.reduce((sum, k) => sum + k.getBoundingClientRect().height, 0) + gap * 2;
      setMaskHeight(Math.ceil(ceiling));
    }

    if (reduceMotion) return;
    if (visibleCount <= prev || visibleCount === 0) return;

    const lastChild = col.lastElementChild as HTMLElement | null;
    if (!lastChild) return;

    const shift = lastChild.getBoundingClientRect().height + gap;
    col.style.transition = "none";
    col.style.transform = `translate3d(0, ${shift}px, 0)`;
    void col.getBoundingClientRect();
    col.style.transition = "transform 0.62s cubic-bezier(0.22, 1, 0.36, 1)";
    col.style.transform = "translate3d(0, 0, 0)";
  }, [visibleCount, reduceMotion]);

  const scenario = SCENARIOS[scenarioIdx]!;

  return (
    <section
      aria-label="Andes — Latin America Agentic Commerce platform"
      className="relative isolate w-full overflow-hidden bg-[#0A1428] text-white"
      style={{ minHeight: "100vh" }}
    >
      {/* calm depth — no video, no aurora blob: linear navy + faint dot-grid + soft mint radial */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(180deg, #0A1428 0%, #0B1126 100%)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-[0.55]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(1100px 720px at 72% 26%, black, transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(900px 520px at 82% 8%, rgba(122,224,181,0.09), transparent 62%)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1425px] flex-col px-6 py-12 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7AE0B5]" />
            {t("eyebrow")}
          </span>
        </div>

        <div className="mt-6 grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.02fr] lg:gap-14">
          <div className="flex flex-col">
            <p className="mb-5 max-w-[40ch] font-display text-[12.5px] font-medium tracking-[0.02em] text-white/70">
              {t("scale")}
            </p>
            <h1
              className="font-display font-bold leading-[0.94] tracking-[-0.05em] text-white"
              style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
            >
              <span className="block italic">{t("title1")}</span>
              <span className="block italic">{t("title2")}</span>
            </h1>

            <p
              className="mt-6 max-w-[44ch] font-jp text-white/75"
              style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.12rem)", lineHeight: 1.7 }}
            >
              {t("subhead")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-display text-[14px] font-semibold tracking-[-0.01em] text-[#0A1428] transition duration-300 hover:-translate-y-0.5 hover:bg-[#F3F5F8] active:scale-[0.98]"
                href={`/${locale}/contact`}
              >
                {t("ctaPrimary")}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-7 py-3.5 font-display text-[14px] font-semibold text-white transition duration-300 hover:border-white/45 hover:bg-white/[0.08]"
                href={`/${locale}/about`}
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* light product-surface chat panel (no glass-over-video) */}
          <div
            className="relative w-full transition-opacity duration-500"
            style={{ opacity: scenarioVisible ? 1 : 0 }}
          >
            <div className="overflow-hidden rounded-[22px] bg-[#F6F7F9] ring-1 ring-black/[0.06] shadow-[0_44px_100px_-34px_rgba(0,0,0,0.7)]">
              <header className="flex items-center gap-2.5 border-b border-black/[0.06] bg-white/70 px-5 py-3.5">
                <AgentMark />
                <span className="font-display text-[13px] font-semibold" style={{ color: INK }}>
                  AI Agent
                </span>
                <span className="ml-auto flex items-center gap-1.5 font-display text-[11px]" style={{ color: MUTED }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
                  online
                </span>
              </header>
              <div
                className="relative overflow-hidden px-4 py-4 sm:px-5"
                style={{ height: maskHeight ? `${maskHeight}px` : "min(440px, 54vh)", maxHeight: "62vh" }}
              >
                <div
                  ref={columnRef}
                  className="flex h-full flex-col justify-end gap-2.5"
                  style={{ willChange: "transform" }}
                >
                  {scenario.messages.slice(0, visibleCount).map((msg, idx, arr) => {
                    const age = arr.length - 1 - idx;
                    const opacity = age === 0 ? 1 : age === 1 ? 0.92 : age === 2 ? 0.6 : 0.4;
                    return (
                      <div key={`${scenario.id}-${msg.id}`} style={{ opacity, transition: "opacity 0.5s ease" }}>
                        <ChatBubble message={msg} speaker={scenario.user} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10.5px] uppercase tracking-[0.22em] text-white/50">
          <span className="font-display">{t("metaPhase")}</span>
          <span className="h-px w-6 bg-white/20" />
          <span className="font-display">{t("metaCities")}</span>
          <span className="h-px w-6 bg-white/20" />
          <span className="font-display">{t("metaLangs")}</span>
          <div className="ml-auto flex items-center gap-2">
            {SCENARIOS.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full bg-white/25 transition-all duration-500"
                style={{
                  width: i === scenarioIdx ? 28 : 6,
                  backgroundColor: i === scenarioIdx ? "rgba(255,255,255,0.85)" : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ message, speaker }: { message: ChatMessage; speaker: string }) {
  if (message.type === "user-text") {
    return (
      <div className="flex justify-end">
        <div
          className="flex max-w-[82%] flex-col gap-1 rounded-[16px] rounded-br-[5px] px-3.5 py-2.5"
          style={{ background: USER_BG }}
        >
          <p className="font-jp text-[13px] leading-[1.5]" style={{ color: INK }}>
            {message.text}
          </p>
          <span className="self-end font-display text-[9.5px]" style={{ color: "rgba(10,20,40,0.45)" }}>
            {speaker} · {message.time}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white ring-1 ring-black/[0.06]">
        <AgentMark small />
      </span>
      <div className="flex w-full max-w-[88%] flex-col gap-2 rounded-[16px] rounded-bl-[5px] bg-white px-3.5 py-3 ring-1 ring-black/[0.06]">
        {message.type === "agent-products" ? (
          <>
            <p className="font-jp text-[13px] leading-[1.5]" style={{ color: INK }}>
              {message.text}
            </p>
            <div className="flex flex-col gap-1.5">
              {message.products.map((p, i) => (
                <ProductCard key={i} product={p} colorIndex={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-[12.5px] font-semibold leading-[1.45]" style={{ color: GREEN }}>
              ✓ {message.title}
            </p>
            <div className="flex flex-col gap-1 rounded-[10px] bg-[#F2F4F7] px-3 py-2.5 font-display text-[11px] leading-[1.55]">
              {message.rows.map((r, i) => (
                <Row key={i} row={r} />
              ))}
              <div className="my-1 h-px bg-black/[0.08]" />
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[10.5px] font-medium uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                  Total
                </span>
                <span className="font-display text-[14px] font-bold" style={{ color: INK }}>
                  {message.total}
                </span>
              </div>
            </div>
          </>
        )}
        <span className="self-end font-display text-[9.5px]" style={{ color: MUTED }}>
          {message.time} ✓✓
        </span>
      </div>
    </div>
  );
}

function ProductCard({ product, colorIndex }: { product: Product; colorIndex: number }) {
  const tints = ["#EFD9D2", "#D7E8F1", "#E6E1D2"];
  return (
    <div className="flex items-center gap-3 rounded-[10px] bg-[#F2F4F7] p-2">
      <div className="h-9 w-9 shrink-0 rounded-[7px]" style={{ background: tints[colorIndex % tints.length] }} />
      <div className="flex flex-1 flex-col">
        <span className="font-display text-[11.5px] font-semibold leading-tight" style={{ color: INK }}>
          {product.name}
        </span>
        <span className="font-jp text-[10px] leading-tight" style={{ color: MUTED }}>
          {product.spec}
        </span>
      </div>
      <span className="font-display text-[12px] font-bold" style={{ color: INK }}>
        {product.price}
      </span>
    </div>
  );
}

function Row({ row }: { row: OrderRow }) {
  return (
    <div className="flex items-baseline justify-between">
      <span style={{ color: row.dim ? "rgba(98,106,122,0.7)" : MUTED }}>{row.label}</span>
      <span style={{ color: row.dim ? MUTED : INK, fontWeight: row.label.startsWith("II") ? 700 : 500 }}>
        {row.value}
      </span>
    </div>
  );
}

function AgentMark({ small }: { small?: boolean }) {
  const s = small ? 13 : 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: GREEN }}>
      <path
        d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}
