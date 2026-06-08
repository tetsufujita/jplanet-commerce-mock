"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

const ACCENT = "#7AE0B5";

const GLASS =
  "rounded-[22px] border border-white/[0.10] bg-white/[0.04] backdrop-blur-xl";

/** realistic light "product surface" panel that sits on the dark tile */
const SCREEN =
  "rounded-[14px] bg-[#F6F7F9] ring-1 ring-black/[0.06] shadow-[0_28px_64px_-28px_rgba(0,0,0,0.6)]";

const INK = "#0A1428";
const MUTED = "#626a7a";

function cardMotion(index: number) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: {
      duration: 0.6,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };
}

export function ServicesV4() {
  return (
    <>
      <BentoBand />
      <InfraBand />
    </>
  );
}

/* ─────────────────────────── §2-a  Product-surface bento ─────────────────── */

function BentoBand() {
  const t = useTranslations("v4.services");

  return (
    <section
      aria-label="Andes プラットフォーム"
      className="relative w-full overflow-hidden bg-[#0A1428] py-28 text-white sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 18% -8%, rgba(122,224,181,0.10), transparent 60%), radial-gradient(900px 480px at 92% 8%, rgba(72,118,255,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 sm:px-10 lg:px-16">
        <header className="max-w-[680px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            {t("eyebrow")}
          </span>
          <h2
            className="mt-6 font-display font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.1rem, 4vw, 3.4rem)" }}
          >
            {t("bentoTitle")}
          </h2>
          <p
            className="mt-5 max-w-[52ch] font-jp text-white/65"
            style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)", lineHeight: 1.7 }}
          >
            {t("bentoLead")}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
          <BentoTile index={0} className="md:col-span-4" title={t("tileAgentTitle")}>
            <AgentStorefrontMock />
          </BentoTile>
          <BentoTile index={1} className="md:col-span-2" title={t("tileTaxTitle")}>
            <TaxBillingMock />
          </BentoTile>

          <BentoTile index={2} className="md:col-span-2" title={t("tileLogiTitle")}>
            <LogisticsMock />
          </BentoTile>
          <BentoTile index={3} className="md:col-span-2" title={t("tilePayTitle")}>
            <PixNfeMock />
          </BentoTile>
          <BentoTile index={4} className="md:col-span-2" title={t("tileErpTitle")}>
            <ErpMock />
          </BentoTile>

          <BentoTile index={5} className="md:col-span-6" title={t("tileDashTitle")}>
            <SellerDashboardMock />
          </BentoTile>
        </div>
      </div>
    </section>
  );
}

function BentoTile({
  index,
  className,
  title,
  children,
}: {
  index: number;
  className?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      {...cardMotion(index)}
      className={`group relative flex flex-col overflow-hidden p-6 sm:p-7 ${GLASS} ${className ?? ""}`}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: "radial-gradient(circle, rgba(122,224,181,0.25), transparent 70%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <h3
          className="max-w-[26ch] font-display font-bold leading-[1.2] tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.55rem)" }}
        >
          {title}
        </h3>
        <ExpandIcon />
      </div>
      <div className="relative mt-7 flex-1">{children}</div>
    </motion.div>
  );
}

function ExpandIcon() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/12 bg-white/[0.06] text-white/55 transition-colors duration-300 group-hover:border-white/25 group-hover:text-white/90">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ── product-surface mockups (PT-BR storefront demo, à la Stripe /en-br) ───── */

function AgentStorefrontMock() {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-[152px_1fr]">
      {/* phone: WhatsApp-style agent chat */}
      <div className="mx-auto w-[152px] shrink-0 rounded-[26px] bg-[#0E131C] p-[5px] shadow-[0_28px_64px_-24px_rgba(0,0,0,0.7)]">
        <div className="rounded-[21px] bg-[#F6F7F9] p-2.5">
          <div className="mb-2 flex items-center gap-1.5">
            <SparkleMark dark />
            <span className="font-display text-[10px] font-semibold" style={{ color: INK }}>
              AI Agent
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-end">
              <span className="max-w-[84%] rounded-[11px] rounded-br-[4px] bg-[#D7F4E4] px-2.5 py-1.5 text-[9.5px] leading-[1.35]" style={{ color: INK }}>
                Quero um creme facial japonês 🇯🇵
              </span>
            </div>
            <div className="flex justify-start">
              <span className="max-w-[88%] rounded-[11px] rounded-bl-[4px] bg-white px-2.5 py-1.5 text-[9.5px] leading-[1.35] ring-1 ring-black/[0.05]" style={{ color: INK }}>
                Achei 3 opções perfeitas 😊
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-[10px] bg-white p-1.5 ring-1 ring-black/[0.05]">
              <span className="h-7 w-7 shrink-0 rounded-[6px] bg-[#EFD9D2]" />
              <div className="flex flex-1 flex-col">
                <span className="text-[8.5px] font-semibold leading-tight" style={{ color: INK }}>
                  J-Beauty Creme
                </span>
                <span className="text-[7.5px] leading-tight" style={{ color: MUTED }}>
                  50ml
                </span>
              </div>
              <span className="text-[9px] font-bold" style={{ color: INK }}>
                R$ 245
              </span>
            </div>
            <button
              type="button"
              className="mt-0.5 w-full rounded-full py-1.5 text-[9px] font-semibold text-white"
              style={{ background: INK }}
            >
              Comprar agora
            </button>
          </div>
        </div>
      </div>

      {/* order summary panel */}
      <div className={`flex flex-col justify-center p-5 ${SCREEN}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: MUTED }}>
          Resumo do pedido
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {[
            ["Produto", "R$ 245,00", false],
            ["Frete", "R$ 89,00", false],
            ["Subtotal CIF", "R$ 334,00", false],
            ["II (60%)", "R$ 200,40", true],
          ].map(([label, value, hi]) => (
            <div key={label as string} className="flex items-baseline justify-between text-[12px]">
              <span style={{ color: MUTED }}>{label}</span>
              <span style={{ color: hi ? "#0E9F6E" : INK, fontWeight: hi ? 700 : 500 }}>
                {value}
              </span>
            </div>
          ))}
          <div className="my-1 h-px bg-black/[0.08]" />
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: MUTED }}>
              Total
            </span>
            <span className="text-[18px] font-bold" style={{ color: INK }}>
              R$ 534,40
            </span>
          </div>
        </div>
        <span
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-semibold"
          style={{ background: "rgba(14,159,110,0.12)", color: "#0E9F6E" }}
        >
          ✓ entrega 4–7 dias
        </span>
      </div>
    </div>
  );
}

function TaxBillingMock() {
  const seg = [
    { w: "44%", c: "#0A1428", label: "Produto" },
    { w: "16%", c: "#9aa3b2", label: "Frete" },
    { w: "40%", c: "#0E9F6E", label: "Imposto" },
  ];
  return (
    <div className={`p-4 ${SCREEN}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
        Imposto · automático
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        {[
          ["Subtotal CIF", "R$ 334,00"],
          ["II (60%)", "R$ 200,40"],
        ].map(([l, v]) => (
          <div key={l} className="flex items-baseline justify-between text-[11.5px]">
            <span style={{ color: MUTED }}>{l}</span>
            <span style={{ color: INK, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full">
        {seg.map((s) => (
          <span key={s.label} style={{ width: s.w, background: s.c }} />
        ))}
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-black/[0.08] pt-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: MUTED }}>
          Total
        </span>
        <span className="text-[15px] font-bold" style={{ color: INK }}>
          R$ 534,40
        </span>
      </div>
    </div>
  );
}

function LogisticsMock() {
  const steps = ["Coleta", "Alfândega", "Entrega"];
  return (
    <div className={`p-4 ${SCREEN}`}>
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold"
              style={{
                background: i < 2 ? "#0E9F6E" : "#e4e6eb",
                color: i < 2 ? "#fff" : MUTED,
              }}
            >
              {i < 2 ? "✓" : "3"}
            </span>
            <span className="text-[10.5px] font-medium" style={{ color: INK }}>
              {s}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "#0E9F6E" }}
          initial={{ width: "8%" }}
          whileInView={{ width: "66%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px]" style={{ color: MUTED }}>
          🇯🇵 / 🇰🇷 → 🇧🇷
        </span>
        <span className="text-[12px] font-bold" style={{ color: "#0E9F6E" }}>
          4–7 dias
        </span>
      </div>
    </div>
  );
}

function PixNfeMock() {
  return (
    <div className={`flex flex-col gap-2.5 p-4 ${SCREEN}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-white ring-1 ring-black/[0.06]">
          <QrMark />
        </span>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold" style={{ color: INK }}>
              PIX
            </span>
            <span className="text-[10px]" style={{ color: MUTED }}>
              pagamento instantâneo
            </span>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[9.5px] font-semibold"
            style={{ background: "rgba(14,159,110,0.12)", color: "#0E9F6E" }}
          >
            aprovado
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-[10px] bg-white px-3 py-2.5 ring-1 ring-black/[0.06]">
        <span className="text-[12px] font-semibold" style={{ color: INK }}>
          NF-e
        </span>
        <span className="text-[11px] font-bold" style={{ color: "#0E9F6E" }}>
          emitida ✓
        </span>
      </div>
    </div>
  );
}

function ErpMock() {
  const phases = [
    { p: "Phase 1", on: true },
    { p: "Phase 3", on: false },
    { p: "Phase 4", on: false },
  ];
  return (
    <div className={`flex flex-col gap-3 p-4 ${SCREEN}`}>
      {phases.map((ph, i) => (
        <div key={ph.p} className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: ph.on ? "#0E9F6E" : "#cfd3da" }}
          />
          <span
            className="text-[11.5px] font-semibold"
            style={{ color: ph.on ? INK : MUTED }}
          >
            {ph.p}
          </span>
          <span className="ml-auto text-[10px]" style={{ color: MUTED }}>
            {i === 0 ? "越境EC" : i === 1 ? "ERP・会計" : "与信・カード"}
          </span>
        </div>
      ))}
    </div>
  );
}

const DASH_ROWS: { mark: string; brand: string; country: string; orders: string; vol: string }[] = [
  { mark: "#EFD9D2", brand: "J-Beauty", country: "Japão", orders: "1.240", vol: "R$ 612.400" },
  { mark: "#D7E8F1", brand: "K-Glow", country: "Coreia", orders: "980", vol: "R$ 445.200" },
  { mark: "#E6E1D2", brand: "Sakura Stationery", country: "Japão", orders: "410", vol: "R$ 198.300" },
  { mark: "#E7DAF0", brand: "Anime World", country: "Japão", orders: "350", vol: "R$ 156.000" },
];

function SellerDashboardMock() {
  return (
    <div className={`overflow-hidden ${SCREEN}`}>
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-white/70 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto rounded-full bg-black/[0.05] px-4 py-0.5 text-[10px]" style={{ color: MUTED }}>
          andes.app / marcas
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[12px] font-bold" style={{ color: INK }}>
          Marcas conectadas
        </p>
        <div className="mt-3 overflow-hidden rounded-[10px] ring-1 ring-black/[0.06]">
          <div
            className="grid grid-cols-[1.6fr_1fr_0.8fr_1fr] gap-2 bg-black/[0.03] px-3.5 py-2 text-[9.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: MUTED }}
          >
            <span>Marca</span>
            <span>País</span>
            <span className="text-right">Pedidos</span>
            <span className="text-right">Volume</span>
          </div>
          {DASH_ROWS.map((r) => (
            <div
              key={r.brand}
              className="grid grid-cols-[1.6fr_1fr_0.8fr_1fr] items-center gap-2 border-t border-black/[0.05] px-3.5 py-2.5 text-[11px]"
            >
              <span className="flex items-center gap-2 font-semibold" style={{ color: INK }}>
                <span className="h-5 w-5 shrink-0 rounded-[5px]" style={{ background: r.mark }} />
                {r.brand}
              </span>
              <span style={{ color: MUTED }}>{r.country}</span>
              <span className="text-right" style={{ color: INK }}>
                {r.orders}
              </span>
              <span className="text-right font-semibold" style={{ color: INK }}>
                {r.vol}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── §2-b  Infra / 2-layer flow ──────────────────── */

type FlowNodeId = "ai" | "layer1" | "layer2" | "brand" | "consumer" | "protocol";

function InfraBand() {
  const t = useTranslations("v4.services");
  const [hovered, setHovered] = useState<FlowNodeId | null>(null);

  return (
    <section
      aria-label="Andes インフラ"
      className="relative w-full overflow-hidden bg-[#070D1C] py-28 text-white sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(900px 560px at 50% 48%, black, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(820px 540px at 50% 44%, rgba(122,224,181,0.10), transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1040px] px-6 sm:px-10 lg:px-16">
        <header className="mx-auto max-w-[640px] text-center">
          <h2
            className="font-display font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.1rem, 4vw, 3.4rem)" }}
          >
            {t("infraTitle")}
          </h2>
          <p
            className="mx-auto mt-5 max-w-[54ch] font-jp text-white/65"
            style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)", lineHeight: 1.7 }}
          >
            {t("infraLead")}
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14"
        >
          <FlowDiagram t={t} hovered={hovered} setHovered={setHovered} />
        </motion.div>

        <p className="mx-auto mt-10 max-w-[46ch] text-center font-jp text-[13.5px] leading-[1.7] text-white/55">
          {t("endgame")}
        </p>
      </div>
    </section>
  );
}

function FlowDiagram({
  t,
  hovered,
  setHovered,
}: {
  t: (key: string) => string;
  hovered: FlowNodeId | null;
  setHovered: (id: FlowNodeId | null) => void;
}) {
  const edges: { from: FlowNodeId; to: FlowNodeId; accent?: boolean }[] = [
    { from: "ai", to: "layer1" },
    { from: "layer2", to: "brand" },
    { from: "layer2", to: "consumer" },
    { from: "layer2", to: "protocol", accent: true },
  ];

  const pos: Record<FlowNodeId, { x: number; y: number }> = {
    ai: { x: 500, y: 60 },
    layer1: { x: 500, y: 215 },
    layer2: { x: 500, y: 295 },
    brand: { x: 215, y: 470 },
    consumer: { x: 785, y: 470 },
    protocol: { x: 500, y: 470 },
  };

  const isActive = (id: FlowNodeId) => hovered === id;
  const isDim = (id: FlowNodeId) => hovered !== null && hovered !== id;

  return (
    <svg
      viewBox="0 0 1000 560"
      className="h-auto w-full"
      role="img"
      aria-label="世界の AI から Andes の 2 層構造を通り、ブランド・消費者・LATAM AC Protocol へ価値が流れる図"
    >
      {edges.map((e, i) => {
        const a = pos[e.from];
        const b = pos[e.to];
        const active = isActive(e.from) || isActive(e.to);
        return (
          <g key={`edge-${i}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1.2} />
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={e.accent || active ? ACCENT : "rgba(180,210,255,0.5)"}
              strokeWidth={active ? 2 : 1.3}
              strokeDasharray="5 9"
              strokeLinecap="round"
              className="net-flow"
              style={{
                opacity: hovered && !active ? 0.16 : e.accent ? 0.85 : 0.55,
                transition: "opacity 0.3s, stroke-width 0.3s",
              }}
            />
          </g>
        );
      })}

      <FlowChip
        cx={pos.ai.x}
        cy={pos.ai.y}
        w={188}
        h={52}
        label={t("nodeAI")}
        active={isActive("ai")}
        dim={isDim("ai")}
        onEnter={() => setHovered("ai")}
        onLeave={() => setHovered(null)}
      />

      <g
        onMouseEnter={() => setHovered("layer2")}
        onMouseLeave={() => setHovered(null)}
        style={{
          opacity: hovered !== null && hovered !== "layer1" && hovered !== "layer2" ? 0.45 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <rect x={290} y={178} width={420} height={158} rx={18} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <text x={500} y={166} textAnchor="middle" className="font-display" fontSize={11} fontWeight={700} fill="#FFFFFF" style={{ letterSpacing: "0.22em" }}>
          {t("nodeAndes").toUpperCase()}
        </text>
        <LayerRow y={188} tag={t("layer1Tag")} desc={t("layer1Desc")} accent={false} />
        <LayerRow y={268} tag={t("layer2Tag")} desc={t("layer2Desc")} accent />
      </g>

      <FlowChip cx={pos.brand.x} cy={pos.brand.y} w={210} h={52} label={t("nodeBrand")} active={isActive("brand")} dim={isDim("brand")} onEnter={() => setHovered("brand")} onLeave={() => setHovered(null)} />
      <FlowChip cx={pos.consumer.x} cy={pos.consumer.y} w={210} h={52} label={t("nodeConsumer")} active={isActive("consumer")} dim={isDim("consumer")} onEnter={() => setHovered("consumer")} onLeave={() => setHovered(null)} />
      <FlowChip cx={pos.protocol.x} cy={pos.protocol.y} w={210} h={52} label={t("nodeProtocol")} accentNode active={isActive("protocol")} dim={isDim("protocol")} onEnter={() => setHovered("protocol")} onLeave={() => setHovered(null)} />
    </svg>
  );
}

function LayerRow({ y, tag, desc, accent }: { y: number; tag: string; desc: string; accent: boolean }) {
  return (
    <g>
      <rect x={306} y={y} width={388} height={62} rx={12} fill={accent ? "rgba(122,224,181,0.10)" : "rgba(255,255,255,0.05)"} stroke={accent ? "rgba(122,224,181,0.32)" : "rgba(255,255,255,0.12)"} strokeWidth={1} />
      <text x={326} y={y + 26} className="font-display" fontSize={14} fontWeight={700} fill={accent ? ACCENT : "rgba(255,255,255,0.95)"}>
        {tag}
      </text>
      <text x={326} y={y + 46} className="font-jp" fontSize={11} fill="rgba(255,255,255,0.6)">
        {desc}
      </text>
    </g>
  );
}

function FlowChip({
  cx,
  cy,
  w,
  h,
  label,
  active,
  dim,
  accentNode,
  onEnter,
  onLeave,
}: {
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  active: boolean;
  dim: boolean;
  accentNode?: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: "default", opacity: dim ? 0.45 : 1, transition: "opacity 0.3s" }}>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={14}
        fill={accentNode ? "rgba(122,224,181,0.12)" : "rgba(255,255,255,0.05)"}
        stroke={accentNode ? "rgba(122,224,181,0.45)" : active ? "rgba(122,224,181,0.55)" : "rgba(255,255,255,0.14)"}
        strokeWidth={active ? 1.6 : 1}
        style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" className="font-jp" fontSize={14} fontWeight={600} fill={accentNode ? ACCENT : "rgba(255,255,255,0.92)"}>
        {label}
      </text>
    </g>
  );
}

/* ─────────────────────────────── marks ──────────────────────────────────── */

function SparkleMark({ dark }: { dark?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: dark ? "#0E9F6E" : ACCENT }}>
      <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.92" />
    </svg>
  );
}

function QrMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: INK }}>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14h3v3M21 14v7h-7v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
