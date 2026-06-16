import type { ReactNode } from "react";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpMarquee } from "@/shopify-jp/ui/SpMarquee";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpSectionHeading } from "@/shopify-jp/ui/SpSectionHeading";

/**
 * 06-scale — 「起業家からエンタープライズまで、あらゆる規模のビジネスに」
 * 学習用再現（spec: design/reproductions/shopify-jp/specs/06-scale.md）。
 * 入場アニメは本家になし（animations.json 確認済）→ motion/react 不使用、
 * marquee は CSS keyframes（SpMarquee / sp-marquee）のみ。
 */

// ---------------------------------------------------------------------------
// COPY（学習用 sandbox のため i18n と分離。site 移植時は locales JSON へ）
// ---------------------------------------------------------------------------

interface CaseCardCopy {
  title: string;
  body: ReactNode;
}

const HEADING = "起業家からエンタープライズまで、あらゆる規模のビジネスに";
const CTA_LABEL = "最適なプランを探す";

const CARDS: readonly CaseCardCopy[] = [
  {
    title: "短期間で開業",
    body: (
      <>
        <strong>Yohaku</strong>
        はShopify Basicプランから事業を始めました。Z世代に支持されるアパレルブランドへ成長する中で段階的にプランを引き上げ、いまはShopify
        Plusを基盤に躍進を続けています。
      </>
    ),
  },
  {
    title: "思い通りに規模拡大",
    body: (
      <>
        アスレジャーブランドの<strong>Gymorca</strong>
        は、小さなガレージでの創業から、いまや年間売上高5億米ドル規模のグローバル企業へと駆け上がりました。
      </>
    ),
  },
  {
    title: "小さなチームが大きな夢を叶える",
    body: (
      <>
        <strong>Kuranoko</strong>
        は、食品の再流通でフードロスを減らすことを使命にしています。Shopify
        Plusの導入で、少人数のまま世界水準のストアを構築し、売上を大きく伸ばして急成長しました。
      </>
    ),
  },
];

// ---------------------------------------------------------------------------
// 架空ブランド wordmark（inline SVG、viewBox 190×80、白で直描き = invert 不要）
// ---------------------------------------------------------------------------

function LogoKonoha() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="KONOHA">
      <text
        x="95"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='Futura, "Century Gothic", "Avenir Next", sans-serif'
        fontWeight={500}
        fontSize={26}
        letterSpacing={8}
      >
        KONOHA
      </text>
    </svg>
  );
}

function LogoBlancblanc() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="Blancblanc">
      <text
        x="95"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        fontSize={27}
      >
        <tspan fontWeight={700}>Blanc</tspan>
        <tspan fontWeight={300}>blanc</tspan>
      </text>
    </svg>
  );
}

function LogoObentoCo() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="OBENTO&CO.">
      <text
        x="95"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='Georgia, "Times New Roman", serif'
        fontWeight={700}
        fontSize={24}
        letterSpacing={1}
      >
        OBENTO&amp;CO.
      </text>
    </svg>
  );
}

function LogoGymorca() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="GYMORCA">
      <text
        x="14"
        y="40"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        fontWeight={800}
        fontStyle="italic"
        fontSize={26}
        letterSpacing={0.5}
      >
        GYMORCA
      </text>
      {/* 簡易シャチ（背びれ）図形 */}
      <path d="M152 48 q5 -19 21 -17 q-5 6 -3 13 q-9 -4 -18 4 z" fill="#fff" />
    </svg>
  );
}

function LogoKurashi() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="KURASHI">
      <text
        x="95"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        fontWeight={200}
        fontSize={25}
        letterSpacing={6}
      >
        KURASHI
      </text>
    </svg>
  );
}

function LogoAmairo() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="amairo">
      <text
        x="95"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", sans-serif'
        fontWeight={400}
        fontSize={30}
        letterSpacing={2}
      >
        amairo
      </text>
    </svg>
  );
}

function LogoTsuchinoKaban() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="TSUCHINO KABAN">
      {/* 小紋章（菱形） */}
      <path d="M24 31 l7 8 -7 8 -7 -8 z" fill="none" stroke="#fff" strokeWidth={1.5} />
      <text
        x="110"
        y="37"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontFamily='Georgia, "Times New Roman", serif'
        fontWeight={500}
        fontSize={17}
        letterSpacing={1.5}
      >
        TSUCHINO KABAN
      </text>
      <text
        x="110"
        y="56"
        textAnchor="middle"
        fill="#fff"
        fontFamily='"Hiragino Mincho ProN", serif'
        fontSize={8}
        letterSpacing={3}
      >
        土乃鞄製造所
      </text>
    </svg>
  );
}

function LogoKamogawaBrewing() {
  return (
    <svg viewBox="0 0 190 80" width={190} height={80} role="img" aria-label="KAMOGAWA BREWING CO.">
      {/* 円形 badge 文字組（本家 badge 実測 高 55px → r=27） */}
      <circle cx="95" cy="40" r="27" fill="none" stroke="#fff" strokeWidth={1.5} />
      <text
        x="95"
        y="29"
        textAnchor="middle"
        fill="#fff"
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        fontWeight={600}
        fontSize={8}
        letterSpacing={1.5}
      >
        KAMOGAWA
      </text>
      <path d="M95 35 l5 5 -5 5 -5 -5 z" fill="#fff" />
      <text
        x="95"
        y="55"
        textAnchor="middle"
        fill="#fff"
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        fontWeight={600}
        fontSize={8}
        letterSpacing={1.5}
      >
        BREWING
      </text>
      <text
        x="95"
        y="62"
        textAnchor="middle"
        fill="#fff"
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        fontWeight={600}
        fontSize={7}
        letterSpacing={1}
      >
        CO.
      </text>
    </svg>
  );
}

interface LogoItem {
  name: string;
  Mark: () => ReactNode;
}

const LOGOS: readonly LogoItem[] = [
  { name: "KONOHA", Mark: LogoKonoha },
  { name: "Blancblanc", Mark: LogoBlancblanc },
  { name: "OBENTO&CO.", Mark: LogoObentoCo },
  { name: "GYMORCA", Mark: LogoGymorca },
  { name: "KURASHI", Mark: LogoKurashi },
  { name: "amairo", Mark: LogoAmairo },
  { name: "TSUCHINO KABAN", Mark: LogoTsuchinoKaban },
  { name: "KAMOGAWA BREWING CO.", Mark: LogoKamogawaBrewing },
];

// ---------------------------------------------------------------------------
// カード
// ---------------------------------------------------------------------------

function CaseCard({ title, body }: CaseCardCopy) {
  return (
    // TODO(measure): カード hover 演出（media 再生 / 色変化）は capture から特定不能 → 実測後に追加
    <article className="group flex w-3/4 shrink-0 snap-center flex-col overflow-hidden rounded-xl md:w-auto">
      {/*
        media slot — キャプチャ準拠で空の黒 slot を再現（中身なし）。
        TODO(measure): 本番で hover / lazy により video or 画像が出るか確認 → 必要なら AI 生成画像を object-cover で差す
      */}
      {/* 実測（spec 06 アンカー）: media slot h=300px（top≈358 / bottom≈655）。h4 top 682 / 本文 717〜 */}
      <div className="aspect-[26/17] w-full rounded-b-xl bg-sp-dark md:aspect-auto md:h-[300px]" />
      <div className="mt-6">
        {/* 実測: h4 字送り 20.3px / グリフ ink 幅 120px（6 字）→ fallback 字送り補正で 22px 指定 */}
        <h4 className="mb-2 text-[22px] leading-[26px] font-semibold text-white">{title}</h4>
        {/* 実測: 本文 字送り ≈18.5px / 行送り 23px（5 行 717-823 と一致）→ 補正で 20px/23px。色は実測 #9DA0A6（青み gray、sp-gray #9DABAD は緑寄りで不一致） */}
        <p className="max-w-[65ch] text-[20px] leading-[23px] text-[#9DA0A6] [&_strong]:font-[600]">
          {body}
        </p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// section 本体
// ---------------------------------------------------------------------------

export function SpScale() {
  return (
    // TODO(measure): spacing token（2xl/xl/lg/md/sm/xs）の clamp 解決値 @1440 → 暫定 2xl=88 / xl=48 / lg=32 で配置
    <SpSection id="06-scale" bg="dark" className="pt-[88px]">
      <SpContainer>
        {/*
          左 3/5 相当の折返し（実測 3 行: 起業家からエンタープライズ / まで、あらゆる規模のビジネ / スに）。
          ⚠ ローカルは Noto Sans JP webfont 未ロードで fallback の CJK 字送りが 0.927em（実測）
          → 本家の字送り 54.7px / 行送り 64px に合わせて font-size を 1/0.927 倍補正（55px 相当 → 59.3px）。
          max-w-[12.2em] = 13 文字で折返し（12.05em < 12.2 < 12.98em）。
        */}
        <SpSectionHeading
          title={
            <span className="block max-w-[12.2em] text-[clamp(36.7px,4.1vw,59.3px)] leading-[1.084] text-pretty">
              {HEADING}
            </span>
          }
          className="pb-[78px]"
        />

        {/* md+: 3 col grid / mobile: snap carousel */}
        {/* TODO(measure): mobile snap 位置での opacity/scale transition（DOM に transition-all あり） */}
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-3 md:gap-8 md:overflow-visible">
          {CARDS.map((card) => (
            <CaseCard key={card.title} {...card} />
          ))}
        </div>

        {/* CTA — 透明地 + 白 2px border + 白文字（実測 y 898-953 / w 213px）。SpPillButton outline-white は border-white/40 のため非使用 */}
        <div className="mt-[67px] mb-[70px] flex justify-center">
          {/* TODO(measure): hover の色反転仕様（白塗り + 黒文字は class 命名からの推定） */}
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-3 text-[19.4px] leading-7 font-[550] text-white transition-all duration-150 hover:bg-white hover:text-black"
          >
            {CTA_LABEL}
          </a>
        </div>
      </SpContainer>

      {/* logo marquee — full-bleed / h-20。方向は右流れ（animations.json 実測: translateX(-100%→0)）→ reverse */}
      <div role="group" aria-label="Shopifyを利用するブランド（架空ロゴによる再現）">
        <SpMarquee duration={60} gap={24} reverse className="h-20">
          {LOGOS.map(({ name, Mark }) => (
            <div key={name} className="flex h-20 w-[190px] shrink-0 items-center justify-center">
              <Mark />
            </div>
          ))}
        </SpMarquee>
      </div>

      {/* spacer — 次 section の rounded-t-4xl が食い込む分（本家 pb-4xl -mb-2xl 相当）。marquee 帯 実測 1025-1105 に合わせ調整 */}
      <div aria-hidden className="h-[37px]" />
    </SpSection>
  );
}
