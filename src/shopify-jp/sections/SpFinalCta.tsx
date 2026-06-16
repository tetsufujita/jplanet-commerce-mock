import { useState } from "react";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpPillButton } from "@/shopify-jp/ui/SpPillButton";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { useRevealInView } from "@/shopify-jp/ui/hooks";

/**
 * 13-cta — 「Shopify でビジネスを迅速に構築」conversion section（学習用再現）
 * spec: design/reproductions/shopify-jp/specs/13-cta.md
 * 高さ計画 @1440: pt 108 + 見出し 64 + pb 36 + grid 464 + pb 104 = 776px
 * （capture 実測: 上端 28px は前 section の深緑 #041E18 帯。surface が y28 から
 *   rounded-t-[48px]（corner curve 実測 r≈48）で被さる構図を section 内で再現）
 */

interface Step {
  readonly num: string;
  readonly label: string;
}

const STEPS: readonly Step[] = [
  { num: "01", label: "最初の商品を追加する" },
  { num: "02", label: "ストアをカスタマイズする" },
  { num: "03", label: "決済方法を設定する" },
];

// 生成済みアセット（Higgsfield 新規生成、public/shopify-jp/）
// カードA: 陶器工房 / アパレル作業場 / コスメ撮影 / 梱包風景（warm tone）
const CARD_A_LAYERS: readonly string[] = [
  "/shopify-jp/cta-b1.jpg",
  "/shopify-jp/cta-b2.jpg",
  "/shopify-jp/cta-b3.jpg",
  "/shopify-jp/cta-b4.jpg",
];

// カードB: 店頭受け渡し / スマホで店舗管理 / 花屋 / カフェ
const CARD_B_LAYERS: readonly string[] = [
  "/shopify-jp/cta-b5.jpg",
  "/shopify-jp/cta-b6.jpg",
  "/shopify-jp/cta-b7.jpg",
  "/shopify-jp/cta-b8.jpg",
];

function PhotoCard({
  layers,
  activeIndex,
  inView,
  lifted,
  delayed,
}: {
  layers: readonly string[];
  activeIndex: number;
  inView: boolean;
  lifted: boolean;
  delayed: boolean;
}) {
  return (
    <div
      className={[
        // h-96 = 288×375/281 ≈ 384px を整数化（fractional 高さで list 列の罫線が 2px に滲むのを防止）
        "relative h-96 w-72 shrink-0 overflow-hidden rounded-xl",
        // 入場 reveal: fade + 16px 上昇（spec §4a。本家 motion-safe:opacity-0 translate-y-4 互換）
        "transition-[opacity,transform] duration-500 motion-reduce:transition-none",
        lifted ? "mb-20" : "",
        delayed ? "delay-200" : "",
        inView ? "translate-y-0 opacity-100" : "motion-safe:translate-y-4 motion-safe:opacity-0",
      ].join(" ")}
    >
      {layers.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          aria-hidden
          // 本家互換: active が opacity-100 z-10 / 他 opacity-0 z-0、500ms クロスフェード
          className="absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none"
          style={{
            opacity: activeIndex === i ? 1 : 0,
            zIndex: activeIndex === i ? 10 : 0,
          }}
        />
      ))}
    </div>
  );
}

export function SpFinalCta() {
  // TODO(measure): 入場 reveal の IntersectionObserver threshold（暫定 0.25）
  const { ref: revealRef, inView } = useRevealInView<HTMLDivElement>(0.25);
  // 本家 live 実測 2026-06-10: 15s 観測で自動巡回なし → hover/focus 駆動のみ（idle は default 画像）
  const [index, setIndex] = useState(0);
  const select = (i: number) => {
    setIndex(i);
  };

  // 4 枚 vs 3 ステップ対応の仮説 = default + 3（spec §4b）。
  // TODO(measure): index 0（default 画像）時の行ハイライト挙動 / 非 active 行の正確な text 色
  const activeStep = index - 1; // -1 = default（全行 white）

  return (
    <SpSection
      id="13-cta"
      bg="black"
      // 上端 28px = 前 section の深緑帯、その下に rounded-t-[48px] の surface（capture 実測）
      className="z-10 overflow-hidden pt-[108px] pb-[104px]"
    >
      {/* bg-conversion-gradient 近似（pixel 実測 2026-06-10）。
          帯 #041E18 はベタ（gradient ではない）/ surface 基調 #060809 /
          斜め光 = 約190deg の幅広 band（peak ≈ rgb(32,34,40) @縦55%付近、右上ほど早く現れる） */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#041E18]" />
        <div className="absolute inset-x-0 top-[28px] bottom-0 overflow-hidden rounded-t-[48px] bg-[#060809]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(190deg, rgba(120,110,135,0) 2%, rgba(120,110,135,0.10) 20%, rgba(120,110,135,0.25) 48%, rgba(120,110,135,0.25) 58%, rgba(120,110,135,0.12) 78%, rgba(120,110,135,0) 98%)",
            }}
          />
        </div>
      </div>

      <SpContainer className="relative">
        <div className="pb-9 sm:text-center">
          <h2
            id="conversion-heading"
            className="text-[clamp(34px,3.8vw,55px)] leading-[1.16] font-[330] text-white"
          >
            Shopify でビジネスを迅速に構築
          </h2>
        </div>

        <div className="grid grid-cols-4 items-end gap-x-6 gap-y-12 md:grid-cols-12">
          {/* 画像カラム: 2 枚段違い（A が 80px 持ち上げ）、B は 200ms stagger */}
          <div
            ref={revealRef}
            className="col-span-2 hidden items-end justify-self-end gap-4 sm:flex md:col-span-5 lg:col-span-6"
          >
            <PhotoCard layers={CARD_A_LAYERS} activeIndex={index} inView={inView} lifted delayed={false} />
            <PhotoCard layers={CARD_B_LAYERS} activeIndex={index} inView={inView} lifted={false} delayed />
          </div>

          {/* リストカラム */}
          <div className="col-span-2 md:col-span-7 lg:col-span-6 lg:pl-8">
            {/* mb-16: 本家実測 step3 下端→ボタン上端の余白（≈64px、spec の .mb-2xl） */}
            {/* hover を離れたら default 画像（index 0）へ復帰（本家 idle 状態と一致） */}
            <div role="list" className="mb-16" onMouseLeave={() => { select(0); }}>
              {STEPS.map((step, i) => (
                <p
                  key={step.num}
                  role="listitem"
                  tabIndex={0}
                  onMouseEnter={() => { select(i + 1); }}
                  onFocus={() => { select(i + 1); }}
                  className="mb-6 flex cursor-default items-center"
                >
                  {/* 番号: digit 幅実測 ≈14px/字 → fs 28px */}
                  <span className="w-10 shrink-0 pb-2 text-[28px] font-[330] text-sp-avocado md:w-16">
                    {step.num}
                  </span>
                  {/* text-t4: 本家 ink 実測 470px/10字 → fs ≈48px・行ピッチ 58px（item2 は折返し 2 行） */}
                  <span
                    className={[
                      "grow border-b pb-2 text-[clamp(26px,3.34vw,48px)] leading-[58px] font-[330] transition-colors duration-300",
                      i === STEPS.length - 1 ? "border-transparent" : "border-[#E5E7EB]",
                      activeStep === -1 || activeStep === i ? "text-white" : "text-white/60",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </p>
              ))}
            </div>

            {/* CTA: リスト本文と左揃え（番号カラム幅ぶん indent）。実測 159×55px（border-2 込み） */}
            <div className="sm:pl-10 md:pl-16">
              <SpPillButton variant="primary-white" className="min-w-[159px] justify-center border-2 border-white">
                今すぐトライ
              </SpPillButton>
            </div>
          </div>
        </div>
      </SpContainer>
    </SpSection>
  );
}
