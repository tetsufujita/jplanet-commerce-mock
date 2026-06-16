import { motion, useReducedMotion } from "motion/react";
import type { MotionProps } from "motion/react";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpGlowEllipse } from "@/shopify-jp/ui/SpGlowEllipse";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";

/**
 * 11-checkout — 「世界最高レベルのコンバージョンをもたらすチェックアウト」
 * 学習用再現（spec: design/reproductions/shopify-jp/specs/11-checkout.md）。
 * 左 = 見出し + 統計 2 枚 + 引用 + 注釈（静的）。
 * 右 = チェックアウト UI 3 層（glow / カード / 決済バッジ）が delay 階段の scroll-reveal。
 * アセットは全て CSS / inline SVG / DOM モック（本家 CDN 不使用、架空ブランド konoha 系）。
 */

// ---------------------------------------------------------------------------
// COPY（学習用 sandbox のため i18n と分離。site 移植時は locales JSON へ）
// ---------------------------------------------------------------------------

const HEADING = "世界最高レベルのコンバージョンをもたらすチェックアウト";
const NOTE = "大手コンサルティングファームと共同で 2023 年に実施した第三者調査の結果に基づく数値です。";

// ---------------------------------------------------------------------------
// 小物
// ---------------------------------------------------------------------------

/** チェックアウトカード内の入力行モック */
function FieldRow({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center rounded-md border border-[#d9d9d9] px-3">
      <span className="text-[11px] text-[#8a8a8a]">{label}</span>
    </div>
  );
}

/** 統計 1 枚（border-t + mono ラベル + 大数値。unit は sup=true で上付き小サイズ） */
function StatItem({
  label,
  value,
  unit,
  sup = false,
}: {
  label: string;
  value: string;
  unit: string;
  sup?: boolean;
}) {
  return (
    <li className="flex w-1/2 flex-col justify-between border-t border-[#3a544c] pt-2">
      <span className="block pl-4 font-mono text-xs uppercase text-sp-avocado">{label}</span>
      <div className="mt-3 flex items-start whitespace-nowrap text-white">
        <span className="text-[44px] leading-none [font-weight:330] xl:text-[56px]">{value}</span>
        <span
          className={
            sup
              ? "text-[22px] leading-none [font-weight:330] xl:text-[28px]"
              : "text-[44px] leading-none [font-weight:330] xl:text-[56px]"
          }
        >
          {unit}
        </span>
      </div>
    </li>
  );
}

/** チェックアウト UI カードモック（本家 png 1920×1532 の代替 DOM モック） */
function CheckoutCardMock() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[83%] overflow-hidden rounded-lg bg-white text-[#1a1a1a] shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:max-w-none">
      {/* ショップヘッダー */}
      <div className="border-b border-[#ececec] px-5 py-3">
        <span className="text-[15px] font-semibold tracking-wide">konoha</span>
      </div>

      <div className="px-5 pb-4 pt-4">
        {/* エクスプレスチェックアウト */}
        <p className="text-center text-[11px] text-[#707070]">エクスプレスチェックアウト</p>
        <div className="mt-2.5 space-y-2">
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center rounded-md bg-[#5a31f4]"
          >
            <span className="text-[14px] font-semibold text-white">sora pay</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#ffc439]"
            >
              {/* 架空マーク: 重なる二重円 */}
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                <circle cx="6" cy="8" r="5" fill="#1f3a8a" />
                <circle cx="10" cy="8" r="5" fill="#3b5bd6" fillOpacity="0.85" />
              </svg>
              <span className="text-[13px] font-bold text-[#1f3a8a]">hana</span>
            </button>
            <button
              type="button"
              className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-black"
            >
              {/* 架空マーク: リング */}
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                <circle cx="8" cy="8" r="6" fill="none" stroke="#fff" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2.5" fill="#fff" />
              </svg>
              <span className="text-[13px] font-medium text-white">kumo Pay</span>
            </button>
          </div>
        </div>

        {/* 区切り */}
        <div className="my-3 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#ececec]" />
          <span className="text-[11px] text-[#8a8a8a]">または</span>
          <span className="h-px flex-1 bg-[#ececec]" />
        </div>

        {/* 連絡先 */}
        <div className="space-y-1.5">
          <p className="text-[13px] font-semibold">連絡先</p>
          <FieldRow label="メールアドレス" />
        </div>

        {/* 配送先 */}
        <div className="mt-3 space-y-1.5">
          <p className="text-[13px] font-semibold">配送先</p>
          <FieldRow label="国/地域 — 日本" />
          <div className="grid grid-cols-2 gap-1.5">
            <FieldRow label="姓" />
            <FieldRow label="名" />
          </div>
          <FieldRow label="住所" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// section 本体
// ---------------------------------------------------------------------------

export function SpCheckout() {
  const reduced = useReducedMotion();

  /** 右カラム 3 層共通 reveal（opacity 0→1 / y 16→0、1000ms、delay 階段） */
  const reveal = (delay: number): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          // TODO(measure): IO 閾値・once か毎回か未実測 → once / amount 0.3 を仮置き
          viewport: { once: true, amount: 0.3 },
          // TODO(measure): easing 未実測 → Tailwind transition 既定 cubic-bezier(0.4,0,0.2,1) を仮置き
          transition: { duration: 1, delay, ease: [0.4, 0, 0.2, 1] },
        };

  return (
    <SpSection
      id="11-checkout"
      bg="pine"
      // TODO(measure): 縦 padding 推定（pt 96–128 / pb 128 推定、合計 718px@1440 合わせ。stat 数値 56px 化の分 pb で相殺）
      className="overflow-hidden pt-16 pb-16 md:pt-[128px] md:pb-[112px]"
    >
      {/* 本家 ::before 相当の blurred-ellipse グロー（静的） */}
      {/* TODO(measure): サイズ・blur 量・色・opacity 未実測（#041E18→#072820 程度の微弱グロー） */}
      <SpGlowEllipse
        color="rgba(54,244,164,0.07)"
        className="left-[-12.5%] top-[25%] h-[480px] w-[720px] -rotate-[20deg]"
      />

      <SpContainer>
        <div className="grid grid-cols-1 items-center gap-y-12 md:grid-cols-12 md:gap-x-6">
          {/* 左カラム */}
          <div className="flex flex-col gap-8 md:col-span-6">
            <h3 className="max-w-[580px] text-[34px] leading-[1.18] text-white [font-weight:330] md:text-[48px] md:leading-[56px]">
              {HEADING}
            </h3>

            <ul className="flex gap-x-6 md:mt-8">
              <StatItem label="より高いコンバージョン率" value="15" unit="%" />
              <StatItem label="購買意欲の高い買い物客" value="2億5,000万" unit="+" sup />
            </ul>

            <blockquote className="border-l-2 border-sp-avocado pl-[1em] text-[16px] leading-[23px] text-[#99b3ad]">
              <SpTextLink className="text-[#99b3ad]">Storely Checkout</SpTextLink> に{" "}
              <SpTextLink className="text-[#99b3ad]">Sora Pay</SpTextLink>{" "}
              を加えると、通常のゲスト購入フローと比べて購入完了率が最大 50%
              高まり、世界中の膨大な買い物客層へブランドを届けられます。
            </blockquote>

            <p className="text-[13px] leading-relaxed text-[#99b3ad]">{NOTE}</p>
          </div>

          {/* 右カラム: 3 層 stagger reveal */}
          <div className="relative md:col-span-5 md:col-start-8">
            {/* z-0 グロー（delay 0ms） */}
            <motion.div {...reveal(0)} aria-hidden className="absolute inset-0 z-0">
              <SpGlowEllipse
                color="rgba(54,244,164,0.10)"
                className="left-1/2 top-1/2 h-[120%] w-[140%] -translate-x-1/2 -translate-y-1/2"
              />
            </motion.div>

            {/* z-10 UI カード（delay 330ms） */}
            <motion.div {...reveal(0.33)} className="relative z-10">
              <CheckoutCardMock />
            </motion.div>

            {/* z-20 決済バッジ（delay 660ms） */}
            <motion.div
              {...reveal(0.66)}
              className="absolute bottom-[20%] right-0 z-20 w-[130px] rounded bg-[#5a31f4] px-4 py-3 text-center shadow-md"
            >
              <span className="text-[15px] font-semibold text-white">sora pay</span>
            </motion.div>
          </div>
        </div>
      </SpContainer>
    </SpSection>
  );
}
