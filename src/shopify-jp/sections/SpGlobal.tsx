import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpSectionHeading } from "@/shopify-jp/ui/SpSectionHeading";
import { SpCaptionBlock } from "@/shopify-jp/ui/SpCaptionBlock";
import { SpGlowEllipse } from "@/shopify-jp/ui/SpGlowEllipse";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";
import { useAutoCycle } from "@/shopify-jp/ui/hooks";

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

interface Market { emoji: string; price: string }

// 本家 DOM は 13 item。index 2 = 初期 active（縦カルーセル中央 3 番目）
// TODO(measure): ③ 国ごとの pill 通貨額の正確な値（現状は仮の換算値）
const MARKETS: Market[] = [
  { emoji: "🇮🇹", price: "€109.00" },
  { emoji: "🇯🇵", price: "¥18,400" },
  { emoji: "🇺🇸", price: "$125.00" },
  { emoji: "🇧🇷", price: "R$ 640.00" },
  { emoji: "🇫🇷", price: "€115.00" },
  { emoji: "🇩🇪", price: "€112.00" },
  { emoji: "🇬🇧", price: "£98.00" },
  { emoji: "🇨🇦", price: "CA$ 168.00" },
  { emoji: "🇦🇺", price: "A$ 189.00" },
  { emoji: "🇰🇷", price: "₩168,000" },
  { emoji: "🇪🇸", price: "€105.00" },
  { emoji: "🇲🇽", price: "MX$ 2,150" },
  { emoji: "🇮🇳", price: "₹10,400" },
];

const DEFAULT_MARKET: Market = { emoji: "🇺🇸", price: "$125.00" };

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function marketAt(i: number): Market {
  return MARKETS[mod(i, MARKETS.length)] ?? DEFAULT_MARKET;
}

// 商品写真は未生成 → neutral gradient placeholder（spec §5-b、先行実装）
interface Product { id: string; surface: string }

const PRODUCTS: Product[] = [
  { id: "tote", surface: "linear-gradient(165deg,#DDE0DF 0%,#C6CDCA 55%,#AEB9B5 100%)" },
  { id: "sneaker", surface: "linear-gradient(165deg,#E2DFDA 0%,#CDC8BF 55%,#B3ADA1 100%)" },
  { id: "serum", surface: "linear-gradient(165deg,#D9DEE0 0%,#BFC9CD 55%,#A4B2B8 100%)" },
  { id: "candle", surface: "linear-gradient(165deg,#E0DCD9 0%,#CBC4BF 55%,#B0A8A2 100%)" },
  { id: "bottle", surface: "linear-gradient(165deg,#D8DFDB 0%,#BECAC3 55%,#A2B3AA 100%)" },
  { id: "cap", surface: "linear-gradient(165deg,#DEDEE2 0%,#C7C7CE 55%,#ACADB7 100%)" },
];

/* ------------------------------------------------------------------ */
/* motion constants                                                    */
/* ------------------------------------------------------------------ */

const TILE_PITCH = 76; // tile 64 + gap 12（実測）
const ACTIVE_ROW = 2; // 可視 5 tile 中、上から 3 番目が active
// TODO(measure): ① 進行間隔・easing・1 step 時間（仮 2600ms / easeIn 0.5s）
const STEP_MS = 2600;
// TODO(measure): ④ シーン切替トリガー（時間 or scroll）。仮: 3 step ごとに ①Buy now→②配送ラベル→③地図
const STEPS_PER_SCENE = 3;

type CardRole = "hero" | "left" | "right" | "hidden";

// TODO(measure): ② card-left / card-right の正確な transform（scale 0.83 / 横 offset ±94px は screenshot 推定）
const ROLE_CONFIG: Record<CardRole, { x: number; scale: number; opacity: number; z: number; veil: number }> = {
  hero: { x: 0, scale: 1, opacity: 1, z: 30, veil: 0 },
  left: { x: -94, scale: 0.83, opacity: 1, z: 20, veil: 0.68 },
  right: { x: 94, scale: 0.83, opacity: 1, z: 10, veil: 0.68 },
  hidden: { x: 0, scale: 0.72, opacity: 0, z: 0, veil: 0.68 },
};

function roleOf(cardIndex: number, step: number): CardRole {
  const rel = mod(cardIndex - step, PRODUCTS.length);
  if (rel === 0) return "hero";
  if (rel === 1) return "right";
  if (rel === PRODUCTS.length - 1) return "left";
  return "hidden";
}

/* ------------------------------------------------------------------ */
/* sub parts（1 ファイル完結のため private）                            */
/* ------------------------------------------------------------------ */

/** glow 8 個（z-0、static、teal #157076 系 2 トーン × 回転 3 系統） */
function GlowField() {
  return (
    <div aria-hidden className="absolute inset-0 z-0">
      <SpGlowEllipse color="rgba(21,112,118,0.26)" className="-left-[6%] top-[4%] h-[180px] w-[360px] rotate-45" />
      <SpGlowEllipse color="rgba(21,112,118,0.16)" className="-top-[12%] left-[30%] h-[160px] w-[420px] rotate-[53deg]" />
      <SpGlowEllipse color="rgba(21,112,118,0.14)" className="right-[20%] top-[4%] h-[200px] w-[380px] -rotate-[30deg]" />
      <SpGlowEllipse color="rgba(21,112,118,0.1)" className="-right-[8%] top-[22%] h-[260px] w-[520px] rotate-45" />
      <SpGlowEllipse color="rgba(21,112,118,0.18)" className="bottom-[4%] right-[2%] h-[280px] w-[560px] -rotate-[30deg]" />
      <SpGlowEllipse color="rgba(21,112,118,0.12)" className="-bottom-[14%] left-[44%] h-[220px] w-[460px] rotate-[53deg]" />
      <SpGlowEllipse color="rgba(21,112,118,0.08)" className="-left-[4%] bottom-[8%] h-[200px] w-[400px] rotate-45" />
      <SpGlowEllipse color="rgba(21,112,118,0.2)" className="left-[16%] top-[40%] h-[180px] w-[360px] -rotate-[30deg]" />
    </div>
  );
}

/** 国旗縦カルーセル: wrapper を −76px ずつ送り、window 7 tile を modulo で recycle（疑似無限） */
function FlagsCarousel({ step, reduced }: { step: number; reduced: boolean }) {
  return (
    <div className="absolute left-[12px] top-[13px] h-[368px] w-16 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_75%,transparent_100%)]">
      <motion.div
        className="absolute left-0 top-0 w-16"
        animate={{ y: -step * TILE_PITCH }}
        transition={{ duration: reduced ? 0 : 0.5, ease: "easeIn" }}
      >
        {Array.from({ length: 7 }, (_, row) => {
          const k = step - 1 + row; // 可視 5 + 上下の先読み 2
          const market = marketAt(k);
          const isActive = k === step + ACTIVE_ROW;
          return (
            <div
              key={k}
              style={{ top: k * TILE_PITCH }}
              className={`absolute left-0 grid h-16 w-16 place-items-center rounded-xl transition-colors duration-500 ${
                isActive ? "bg-white/50" : "bg-white/10"
              }`}
            >
              <span
                className={`text-[28px] leading-none transition-opacity duration-500 ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
              >
                {market.emoji}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/** 商品カード 6 枚スタック + 注文 pill（hero のみ delay 付きで rise-in） */
function CardStack({ step, reduced, activeMarket }: { step: number; reduced: boolean; activeMarket: Market }) {
  return (
    <div className="absolute left-[290px] top-[28px] h-[310px] w-[236px]">
      {PRODUCTS.map((product, i) => {
        const role = roleOf(i, step);
        const cfg = ROLE_CONFIG[role];
        const isHero = role === "hero";
        return (
          <motion.div
            key={product.id}
            style={{ zIndex: cfg.z }}
            animate={{ x: cfg.x, scale: cfg.scale, opacity: cfg.opacity }}
            transition={{ duration: reduced ? 0 : 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col gap-3 rounded-lg bg-white p-4"
          >
            {/* 商品画像枠（placeholder gradient） */}
            <div className="grow overflow-hidden rounded" style={{ background: product.surface }} />
            {/* Buy now */}
            <div className="grid min-h-[52px] place-items-center rounded-[4px] bg-[linear-gradient(180deg,#1E3A3C_0%,#1A3233_100%)] text-[14px] font-bold leading-5 text-white shadow-[0_10px_18px_rgba(8,26,28,0.45)]">
              Buy now
            </div>
            {/* card-overlay: 非 hero を deep-green で沈ませる */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-lg bg-sp-green"
              animate={{ opacity: cfg.veil }}
              transition={{ duration: reduced ? 0 : 0.5 }}
            />
            {/* 注文 pill（active card のみ delay-500 duration-1000 で fade+rise） */}
            <motion.div
              animate={isHero ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
              transition={
                isHero
                  ? { delay: reduced ? 0 : 0.5, duration: reduced ? 0 : 1 }
                  : { duration: reduced ? 0 : 0.5 }
              }
              className="absolute left-[80%] top-[40%] z-40 flex w-max items-center gap-1.5 rounded-full bg-white p-1 pr-4 shadow-2xl"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[#D9DEDE] bg-[#EFF2F1] text-[18px] leading-none">
                {activeMarket.emoji}
              </span>
              <span className="text-[14px] leading-5 text-black">
                次に注文：<span className="ml-1 tabular-nums">{activeMarket.price}</span>
              </span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** シーン②: 配送ラベル作成 window（本家 PNG → CSS モックで再構築） */
function CheckoutWindow({ visible, reduced, price }: { visible: boolean; reduced: boolean; price: string }) {
  return (
    <motion.div
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: reduced ? 0 : 0.5, ease: "easeInOut" }}
      className="absolute left-[56%] top-[12px] z-20 w-80 overflow-hidden rounded-xl bg-white shadow-2xl"
    >
      {/* browser chrome */}
      <div className="flex items-center gap-2 bg-[#ECF0EF] px-3 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D2D8D6]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D2D8D6]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D2D8D6]" />
        </span>
        <span className="ml-1 grow rounded-full bg-white px-3 py-1 text-[11px] leading-none text-[#7C8A8C]">
          konoha.jp/shipping
        </span>
      </div>
      {/* 配送ラベル form モック */}
      <div className="flex flex-col gap-3 p-4">
        <div className="text-[13px] font-bold leading-5 text-[#0B1B1D]">配送ラベルの作成</div>
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-3/4 rounded-full bg-[#E3E8E7]" />
          <div className="h-2.5 w-1/2 rounded-full bg-[#E3E8E7]" />
        </div>
        <div className="flex items-center justify-between rounded-md border border-[#E0E5E4] p-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-24 rounded-full bg-[#E3E8E7]" />
            <div className="h-2 w-16 rounded-full bg-[#EDF0EF]" />
          </div>
          <span className="text-[12px] font-bold leading-none text-[#0B1B1D]">{price}</span>
        </div>
        <div className="grid h-10 place-items-center rounded-[4px] bg-[linear-gradient(180deg,#1E3A3C_0%,#1A3233_100%)] text-[13px] font-bold text-white">
          ラベルを購入
        </div>
      </div>
    </motion.div>
  );
}

// dot-matrix の landmass は mask で近似
const MAP_MASK =
  "radial-gradient(ellipse 30% 26% at 22% 30%, #000 55%, transparent 78%), radial-gradient(ellipse 22% 34% at 38% 72%, #000 55%, transparent 80%), radial-gradient(ellipse 34% 30% at 68% 34%, #000 55%, transparent 78%), radial-gradient(ellipse 26% 24% at 86% 66%, #000 50%, transparent 78%)";

/** シーン③: 「配送済み」ピン付き世界地図 */
// TODO(measure): ⑤ 本家地図の実体（canvas/SVG/img）と正確な座標。現状は dot-matrix 近似モック
function WorldMap({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.5 }}
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[48%]"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(157,171,173,0.55) 1.3px, transparent 1.4px)",
          backgroundSize: "15px 15px",
          maskImage: MAP_MASK,
          WebkitMaskImage: MAP_MASK,
        }}
      />
      <div className="absolute left-[58%] top-[28%] flex flex-col items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold leading-none text-[#0B1B1D] shadow-lg">
          配送済み
        </span>
        <span className="h-3 w-3 rounded-full bg-sp-avocado shadow-[0_0_0_6px_rgba(54,244,164,0.25)]" />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* section                                                             */
/* ------------------------------------------------------------------ */

/**
 * 05-global — 世界へ広がる可能性（local-and-global）
 * 構成: h2 → deep-green 1 枚パネル（glow / 国旗縦カルーセル / 商品カードスタック /
 * checkout window / 世界地図 / 下部 caption）。section 全高 ≈ 827px @1440。
 */
export function SpGlobal() {
  const reduced = useReducedMotion() === true;
  // 唯一のタイマー（in-view 外と reduced-motion で停止）。index は modulo なので
  // 単調増加の step に変換して carousel / cards / scene を同期させる
  const { ref: panelRef, index } = useAutoCycle<HTMLDivElement>(MARKETS.length, STEP_MS);
  const [step, setStep] = useState(0);
  const lastIndex = useRef(index);

  useEffect(() => {
    if (index !== lastIndex.current) {
      lastIndex.current = index;
      setStep((s) => s + 1);
    }
  }, [index]);

  const activeMarket = marketAt(step + ACTIVE_ROW);
  const scene = Math.floor(step / STEPS_PER_SCENE) % 3;
  // reduced-motion 時は autoplay 停止 + シーン要素を静的表示
  const checkoutVisible = reduced ? true : scene === 1;
  const mapVisible = reduced ? true : scene === 2;

  return (
    // TODO(measure): ⑥ 下 padding（class は pb-2xl だが capture 実測 38px → 38px 採用）
    <SpSection id="05-global" bg="dark" className="pt-24 pb-[38px]">
      <SpContainer>
        <SpSectionHeading title="世界へ広がる可能性" className="mb-[33px]" />
        <div
          ref={panelRef}
          className="relative flex h-[596px] flex-col justify-between overflow-hidden rounded-xl border-t border-[#1E2C31] bg-sp-green p-8 shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
        >
          <GlowField />
          {/* ビジュアル行（decorative） */}
          <div aria-hidden className="relative z-10 h-[380px]">
            <FlagsCarousel step={step} reduced={reduced} />
            <CardStack step={step} reduced={reduced} activeMarket={activeMarket} />
            <CheckoutWindow visible={checkoutVisible} reduced={reduced} price={activeMarket.price} />
            <WorldMap visible={mapVisible} reduced={reduced} />
          </div>
          {/* caption typo は capture 実測で override: title 20px / body 18px / lh 23px（共有 defaults 18/14 より大） */}
          <SpCaptionBlock
            title="国境を越えた販売"
            className="relative z-10 [&>h4]:text-[20px] [&>p]:text-[18px] [&>p]:leading-[23px]"
          >
            konoha なら、低コストで素早い海外配送の手配から、
            <SpTextLink href="#">konoha Markets</SpTextLink>
            による地域ごとの購買体験の最適化まで、越境販売につきものの煩雑な作業をひとまとめに解決できます。
          </SpCaptionBlock>
        </div>
      </SpContainer>
    </SpSection>
  );
}
