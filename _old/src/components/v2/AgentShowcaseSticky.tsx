"use client";

import Image from "next/image";
import { type ReactNode } from "react";

import { AgenticChatPlayer } from "@/components/v2/AgenticChatPlayer";
import { LogoMarquee } from "@/components/v2/LogoMarquee";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
};

/**
 * Vertically-stacked full-width section cards (no sticky sidebar). Each
 * frame has its own background palette and interior layout; cards inside
 * use glass morphism (semi-transparent dark + backdrop-blur) so the
 * background photo / gradient reads through.
 *
 * The `locale` is plumbed through for any future CTAs that need it; today
 * none of the frames link out, but keep the prop so we don't have to thread
 * it later.
 */
export function AgentShowcaseSticky({ locale: _locale }: Props) {
  return (
    <SectionWrapper id="showcase" label="Andes が動かす Agentic Commerce" rhythm="large">
      <div className="flex flex-col gap-6 lg:gap-8">
        <FrameWhatsApp />
        <FrameCatalog />
        <FrameLogistics />
        <FrameOrders />
        <FrameProtocol />
      </div>
    </SectionWrapper>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Shared helpers
 * ────────────────────────────────────────────────────────────────────────── */

function FrameCard({
  background,
  children,
  ringClass = "border-white/8",
}: {
  background: ReactNode;
  children: ReactNode;
  ringClass?: string;
}) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[32px] border ${ringClass}`}>
      {background}
      <div className="relative z-10 px-7 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24">{children}</div>
    </div>
  );
}

function GlassCard({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  const palette =
    tone === "light"
      ? "border-[#3A1F0F]/12 bg-white/65 text-[#3A1F0F]"
      : "border-white/12 bg-white/[0.07] text-white";
  return (
    <div
      className={`rounded-2xl border ${palette} p-5 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.35)]`}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      className="font-display text-[11px] font-medium uppercase tracking-[0.22em] sm:text-[13px]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

function FrameTitle({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <h3
      className="max-w-[22ch] font-jp text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.08] tracking-[-0.035em]"
      style={{ color: tone === "light" ? "#3A1F0F" : "#fff" }}
    >
      {children}
    </h3>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Frame 1 — WhatsApp Agent (deep teal/green)
 * ────────────────────────────────────────────────────────────────────────── */
function FrameWhatsApp() {
  return (
    <FrameCard
      background={
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, rgba(34,80,68,0.95) 0%, rgba(10,28,28,0.95) 60%, rgba(8,20,20,0.95) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 40% at 80% 10%, rgba(122,224,181,0.18) 0%, rgba(10,28,28,0) 70%)," +
                "radial-gradient(40% 30% at 10% 90%, rgba(240,232,192,0.10) 0%, rgba(10,28,28,0) 70%)",
            }}
          />
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-3">
            {[
              { short: "GPT", title: "ChatGPT" },
              { short: "CL", title: "Claude" },
              { short: "GO", title: "Google AI" },
              { short: "META", title: "Meta AI" },
            ].map((a) => (
              <span
                className="grid h-10 w-10 place-items-center rounded-full bg-white font-display text-[10px] font-bold uppercase tracking-[0.04em] text-[#0A1428] sm:h-12 sm:w-12 sm:text-[11px]"
                key={a.short}
                title={a.title}
              >
                {a.short}
              </span>
            ))}
          </div>
          <Eyebrow color="#7AE0B5">01 · Agentic Commerce · 購入</Eyebrow>
          <FrameTitle>WhatsApp などのチャットで、購入が完結する。</FrameTitle>
          <p className="max-w-[44ch] font-jp text-[14px] leading-[1.7] text-white/72 sm:text-[15px]">
            LATAM の AI Agent（ChatGPT / Claude / Google AI）が J-Planet の catalog と在庫を直接呼び出す。買い物客は WhatsApp で会話するだけで、日本品質の商品が現地価格で届く。
          </p>
        </div>
        <div className="relative">
          <AgenticChatPlayer />
        </div>
      </div>
    </FrameCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Frame 2 — Catalog (cream warm)
 * ────────────────────────────────────────────────────────────────────────── */
function FrameCatalog() {
  const brands = [
    "SHISEIDO",
    "innisfree",
    "MUJI",
    "DHC",
    "LANEIGE",
    "POLA",
    "Kanebo",
    "HABA",
    "FANCL",
    "Etude",
    "missha",
    "Kosé",
  ];
  return (
    <FrameCard
      background={
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 100% 0%, rgba(255,228,200,0.96) 0%, rgba(255,242,224,0.96) 50%, rgba(248,232,210,0.96) 100%)",
            }}
          />
          <Image
            alt=""
            aria-hidden
            className="object-cover opacity-[0.08] mix-blend-multiply"
            fill
            sizes="100vw"
            src="https://images.unsplash.com/photo-1601925240970-98447ad5b8cf?w=1600&q=80&auto=format&fit=crop"
            unoptimized
          />
        </>
      }
      ringClass="border-[#3A1F0F]/10"
    >
      <div className="flex flex-col gap-7">
        <Eyebrow color="#B8742A">02 · Catalog · 商品</Eyebrow>
        <FrameTitle tone="light">日韓品質 1,700 SKU を、Phase 1 から。</FrameTitle>
        <p className="max-w-[44ch] font-jp text-[14px] leading-[1.7] text-[#5C3818] sm:text-[15px]">
          資生堂・innisfree・MUJI など、ブラジルでまだ広く流通していない日韓ブランドを Phase 1 から全量投入。Andes が直接買い付け、PRC 経由で関税最適化。
        </p>
        <GlassCard tone="light">
          <LogoMarquee
            duration={50}
            items={brands.map((b) => (
              <span
                className="whitespace-nowrap font-display text-[clamp(0.95rem,1.2vw,1.15rem)] font-semibold uppercase tracking-[0.18em] text-[#3A1F0F]/82"
                key={b}
              >
                {b}
              </span>
            ))}
          />
        </GlassCard>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total SKU", value: "1,700" },
            { label: "Brands", value: "120+" },
            { label: "Categories", value: "美容 / 健食 / 雑貨" },
            { label: "Markup", value: "JP → BR 適正化" },
          ].map((s) => (
            <GlassCard key={s.label} tone="light">
              <div className="flex flex-col gap-1">
                <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-[#5C3818]/60">
                  {s.label}
                </span>
                <span className="font-jp text-[14px] font-bold text-[#3A1F0F]">{s.value}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </FrameCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Frame 3 — Logistics (dark warehouse photo bg + glass step cards)
 * ────────────────────────────────────────────────────────────────────────── */
function FrameLogistics() {
  const steps = [
    {
      step: "01",
      label: "Seller 出荷",
      body: "日本 / 韓国 から JP Post EMS で集約。Seller は出荷だけ。",
      brand: "JP Post",
    },
    {
      step: "02",
      label: "通関 / PRC",
      body: "PRC + SISCOMEX で自動申告。関税最適化、書類は Andes 側で処理。",
      brand: "SISCOMEX",
    },
    {
      step: "03",
      label: "ANVISA",
      body: "化粧品 / 健康食品の規制 compliance、ロット管理まで一気通貫。",
      brand: "ANVISA",
    },
    {
      step: "04",
      label: "現地配送",
      body: "Correios + 民間 last-mile の bestpath で平均 4-7 営業日。",
      brand: "Correios",
    },
  ];
  return (
    <FrameCard
      background={
        <>
          <Image
            alt=""
            aria-hidden
            className="object-cover"
            fill
            sizes="100vw"
            src="https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=1600&q=80&auto=format&fit=crop"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,20,40,0.86) 0%, rgba(10,20,40,0.55) 50%, rgba(10,20,40,0.86) 100%)",
            }}
          />
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-7">
          <Eyebrow color="#FFB89E">03 · Logistics · 物流 / 通関</Eyebrow>
          <FrameTitle>規制と物流は、Andes が担う。</FrameTitle>
          <p className="max-w-[44ch] font-jp text-[14px] leading-[1.7] text-white/72 sm:text-[15px]">
            PRC 申請中、SISCOMEX / ANVISA / MAPA / VIGIAGRO / RDE-IED まで自社運用。Seller は商品出荷だけに集中、複雑な書類仕事は一切不要。
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {steps.map((s) => (
            <li key={s.step}>
              <GlassCard>
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/12 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFB89E]">
                    {s.step}
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-jp text-[15px] font-semibold text-white">
                        {s.label}
                      </span>
                      <span className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">
                        {s.brand}
                      </span>
                    </div>
                    <span className="font-jp text-[13px] leading-[1.6] text-white/72">
                      {s.body}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      </div>
    </FrameCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Frame 4 — Orders / NF-e (almost-black dashboard)
 * ────────────────────────────────────────────────────────────────────────── */
function FrameOrders() {
  return (
    <FrameCard
      background={
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, rgba(20,20,28,0.96) 0%, rgba(8,8,12,0.98) 60%, rgba(0,0,0,1) 100%)",
          }}
        />
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-7">
          <Eyebrow color="#A9B5FF">04 · Orders · 注文管理 / NF-e</Eyebrow>
          <FrameTitle>NF-e 発行、ICMS 計算、在庫同期、すべて自動。</FrameTitle>
          <p className="max-w-[44ch] font-jp text-[14px] leading-[1.7] text-white/72 sm:text-[15px]">
            ブラジル特有の電子請求書（NF-e）、州別の ICMS 税率、在庫管理を Andes ERP が一元管理。Seller は API を叩くだけ、書類は一切触らない。
          </p>
        </div>
        <GlassCard>
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span className="font-display text-[10px] uppercase tracking-[0.22em] text-white/55">
              Andes ERP · Orders
            </span>
          </div>
          <ul className="mt-4 flex flex-col divide-y divide-white/8">
            {[
              { order: "#J-2691", brand: "資生堂 HAKU", value: "R$ 289,00", tax: "ICMS 18%", state: "NF-e ✓" },
              { order: "#J-2692", brand: "innisfree", value: "R$ 152,00", tax: "ICMS 17%", state: "発送済" },
              { order: "#J-2693", brand: "DHC", value: "R$ 78,00", tax: "ICMS 18%", state: "通関中" },
              { order: "#J-2694", brand: "MUJI", value: "R$ 410,00", tax: "ICMS 20%", state: "ANVISA 確認" },
              { order: "#J-2695", brand: "POLA", value: "R$ 690,00", tax: "ICMS 18%", state: "Pix 決済待" },
            ].map((o) => (
              <li
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 py-3 font-display text-[12px] text-white/82"
                key={o.order}
              >
                <span className="text-[#A9B5FF]">{o.order}</span>
                <span className="font-jp text-white">{o.brand}</span>
                <span className="text-white/55">{o.tax}</span>
                <span className="text-right">
                  <span className="font-bold text-white">{o.value}</span>
                  <br />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#7AE0B5]">
                    {o.state}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/8 pt-4">
            {[
              { label: "今日の注文", value: "247" },
              { label: "売上 (R$)", value: "62.4K" },
              { label: "NF-e 発行", value: "100%" },
            ].map((s) => (
              <div className="flex flex-col gap-1" key={s.label}>
                <span className="font-display text-[9px] uppercase tracking-[0.22em] text-white/45">
                  {s.label}
                </span>
                <span className="font-display text-[18px] font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </FrameCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Frame 5 — AC Protocol (purple gradient)
 * ────────────────────────────────────────────────────────────────────────── */
function FrameProtocol() {
  return (
    <FrameCard
      background={
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(110% 90% at 0% 0%, rgba(96,72,200,0.95) 0%, rgba(50,32,140,0.95) 50%, rgba(20,18,60,0.95) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(40% 50% at 90% 100%, rgba(255,160,200,0.18) 0%, rgba(20,18,60,0) 70%)," +
                "radial-gradient(40% 30% at 10% 0%, rgba(240,232,192,0.10) 0%, rgba(20,18,60,0) 70%)",
            }}
          />
        </>
      }
    >
      <div className="flex flex-col gap-7">
        <Eyebrow color="#FFE0A0">05 · 長期 vision · 2028</Eyebrow>
        <FrameTitle>秘密兵器、Andes Protocol。</FrameTitle>
        <p className="max-w-[48ch] font-jp text-[14px] leading-[1.75] text-white/85 sm:text-[15px]">
          2028 年、LATAM の Agentic Commerce が動く共通インフラを Andes が発行する。PIX / NF-e / ICMS / LGPD を MCP で抽象化し、巨人も Andes プロトコルを呼ぶ構造へ。
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            "PIX・NF-e・ICMS・LGPD を MCP で統一",
            "OSS de facto として LATAM 全土に開放",
            "OpenAI / Google / Anthropic が Andes を呼ぶ",
          ].map((b, i) => (
            <li key={b}>
              <GlassCard>
                <div className="flex items-start gap-3">
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFE0A0]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-jp text-[13px] leading-[1.65] text-white/92 sm:text-[14px]">
                    {b}
                  </span>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      </div>
    </FrameCard>
  );
}
