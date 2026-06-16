import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpMarquee } from "@/shopify-jp/ui/SpMarquee";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";
import { useRevealInView } from "@/shopify-jp/ui/hooks";

/**
 * 08-apps — アプリですべてをカスタマイズ
 * 本家: deep-navy(#000A1E) 上にアプリロゴコラージュの超低速 marquee（右へ約 6.7px/s）、
 * 左上に見出しオーバーレイ（斜めグラデで可読確保）、hover で懐中電灯 spotlight。
 * 高さ @1440: mt-16(64) + tile 480 + pb-20(80) = 624px。
 */

const COPY = {
  headingLead: "アプリですべてを",
  headingTail: "カスタマイズ",
  bodyBefore:
    "標準機能だけでも、販売に必要な土台はひと通り揃っています。さらに踏み込んだ機能が欲しくなったら、業種や課題ごとに特化した 13,000 以上の拡張アプリが並ぶ",
  bodyLink: "アプリストア",
  bodyAfter: "から自由に追加できます。",
  marqueeLabel: "多数のコマースアプリのロゴが横に流れるアニメーション",
} as const;

/* ---- コラージュ用の架空アプリ（CSS/DOM モック、本家画像は使わない） ---- */

interface PaletteEntry {
  card: string;
  icon: string;
}

/* navy 背景に映える、彩度低めの多色パレット */
const PALETTE: readonly PaletteEntry[] = [
  { card: "#101d33", icon: "#44608c" }, // slate blue
  { card: "#1a1626", icon: "#5a4e7a" }, // dusty purple
  { card: "#0d2420", icon: "#3e6e64" }, // muted teal
  { card: "#241a12", icon: "#8c6a4e" }, // clay
  { card: "#16200f", icon: "#5e7a52" }, // moss
  { card: "#241319", icon: "#8c5666" }, // rose
  { card: "#221e0e", icon: "#8c7e46" }, // mustard
  { card: "#0e1e24", icon: "#4e6e7a" }, // steel
] as const;

// TODO(measure): コラージュ内部の正確な行数・カード寸法感は本家を目視観察して調整（spec 要実測 6）
const ROWS: readonly (readonly string[])[] = [
  ["konoha", "lumora", "sashiko pay", "tsugi reviews", "hanico shipping", "mochi loyalty", "kaze SEO"],
  ["tonbo analytics", "yuzu chat", "hoshi POS", "fude design", "nami returns", "kumo backup", "taki sync", "hato mail"],
  ["sumi invoice", "momiji translate", "ringo subscriptions", "koma checkout", "sora forms", "tsubaki email"],
  ["ishi inventory", "niji upsell", "matsu wholesale", "ume coupons", "hana gift", "tori tracking", "kawa flow", "yama search"],
] as const;

function AppCollageTile() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex h-[240px] w-[800px] shrink-0 flex-col gap-4 overflow-hidden select-none md:h-[360px] md:w-[1200px] lg:h-[480px] lg:w-[1600px]"
    >
      {ROWS.map((row, r) => (
        <div key={r} className="flex h-[104px] shrink-0 gap-4">
          {row.map((name, c) => {
            const palette = PALETTE[(r * 3 + c) % PALETTE.length] ?? { card: "#101d33", icon: "#44608c" };
            return (
              <div
                key={name}
                className="flex h-full flex-1 items-center gap-4 rounded-2xl px-6"
                style={{ backgroundColor: palette.card }}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[22px] font-semibold text-white/85"
                  style={{ backgroundColor: palette.icon }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[17px] font-medium whitespace-nowrap text-white/90">{name}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---- section 本体 ---- */

export function SpApps() {
  // TODO(measure): 入場フェードの IO threshold / 見出しと marquee の stagger 有無（spec 要実測 1）→ 同時発火 + threshold 0.25 で仮実装
  const { ref, inView } = useRevealInView<HTMLDivElement>(0.25);
  const reduced = useReducedMotion();
  const spotRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  // TODO(measure): spotlight 追従の更新頻度・円サイズ（spec 要実測 2）→ rAF throttle + 30% で仮実装
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const { currentTarget, clientX, clientY } = e;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = spotRef.current;
      if (!el) return;
      const rect = currentTarget.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${String(clientX - rect.left)}px`);
      el.style.setProperty("--spot-y", `${String(clientY - rect.top)}px`);
    });
  };

  return (
    <SpSection id="08-apps" bg="navy" className="overflow-hidden pb-20">
      <div ref={ref} className="relative overflow-clip">
        {/* 見出しレイヤー: md+ は marquee 上に絶対配置（container は高さ 0） */}
        <SpContainer className="relative z-10 md:h-0">
          <div
            className={`mt-16 max-w-[33rem] transition-opacity duration-1000 md:absolute md:max-w-[38rem] ${
              inView ? "opacity-100" : "md:motion-safe:opacity-0"
            }`}
          >
            {/* TODO(measure): この section 単体の text-t3 / text-b3 実 px（spec 要実測 4） */}
            <h3 className="mb-6 text-[clamp(34px,3.8vw,55px)] leading-[1.16] font-[330] text-pretty text-white">
              {COPY.headingLead}
              {/* カタカナ語の途中折返し（カスタマ/イズ）を防ぐ */}
              <span className="inline-block">{COPY.headingTail}</span>
            </h3>
            {/* TODO(measure): text-gray-d の実 hex（spec 要実測 5）→ #9797A2 で仮置き */}
            <p className="text-[18px] leading-[1.6] text-[#9797A2]">
              {COPY.bodyBefore}
              <SpTextLink href="#">{COPY.bodyLink}</SpTextLink>
              {COPY.bodyAfter}
            </p>
          </div>
        </SpContainer>

        {/* marquee ブロック */}
        <div
          role="img"
          aria-label={COPY.marqueeLabel}
          className="group relative mt-12 md:mt-16"
          onMouseMove={handleMouseMove}
        >
          <div
            className={`transition-opacity duration-1000 ease-out ${
              inView ? "opacity-100" : "motion-safe:opacity-0"
            }`}
          >
            {/* 実測: translate(-100%)→(0) / 240s / linear / infinite ≒ 右へ約 6.7px/s。hover で停止 */}
            <SpMarquee duration={240} gap={16} reverse pauseOnHover>
              <AppCollageTile />
            </SpMarquee>
          </div>

          {/* 斜めグラデ overlay（md+）: 左上を navy で塗り潰し見出しの下地に */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] hidden h-[300px] md:block lg:h-[330px] xl:h-[360px] [background:linear-gradient(145deg,#000A1E_47%,rgba(0,10,30,0.9)_67%,transparent_90%)]"
          />

          {/* hover spotlight: mix-blend-darken の懐中電灯（白=透過 / navy=沈む） */}
          <div
            ref={spotRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-darken transition-opacity duration-1000 group-hover:opacity-60"
            style={{
              background:
                "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), #ffffff, #000A1E 30%)",
            }}
          />
        </div>

        {/* 上下 25% fade（deep-navy → transparent） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-sp-navy to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-sp-navy to-transparent"
        />
      </div>
    </SpSection>
  );
}
