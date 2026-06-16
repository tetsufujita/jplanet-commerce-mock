import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { useAutoCycle } from "@/shopify-jp/ui/hooks";

/**
 * 02-logos — Merchant Showcase（タブ連動カルーセル）
 * spec: design/reproductions/shopify-jp/specs/02-logos.md
 * 実体 = 4 文タブ見出し + 12 merchant screenshot のタブ連動カルーセル。
 * merchant 画像は AI 生成までの暫定 CSS モック（架空ブランド konoha 系、本家 CDN 参照なし）。
 */

// TODO(measure): 自動送り間隔は推定 5000ms（in-view 発火条件は useAutoCycle が担保）
/* 本家 live 実測 2026-06-10: aria-selected 変化間隔 ≈5100ms */
const AUTO_CYCLE_MS = 5100;
// panel 間 gap = var(--margin) ≈ 90px @1425（spec §1）
const PANEL_GAP_PX = 90;

interface Merchant {
  name: string;
  domain: string;
  wide: boolean;
  alt: string;
  tagline: string;
  bgClass: string;
  inkClass: string;
}

interface MerchantPanel {
  tab: string;
  merchants: Merchant[];
}

const MERCHANT_PANELS: MerchantPanel[] = [
  {
    tab: "お客さまが買い物をするあらゆる場所で販売しましょう。",
    merchants: [
      {
        name: "Lumera",
        domain: "lumera.example",
        wide: true,
        alt: "ハンドメイドジュエリーを扱う Lumera のストア画面",
        tagline: "Fine Jewelry",
        bgClass: "bg-[linear-gradient(160deg,#1c1a17_0%,#3a322a_55%,#141210_100%)]",
        inkClass: "text-[#e7dcc8]",
      },
      {
        name: "DECKROW",
        domain: "deckrow.example",
        wide: false,
        alt: "スケーター向けアパレル DECKROW のストア画面（モバイル表示）",
        tagline: "Skate & Street",
        bgClass: "bg-[linear-gradient(180deg,#3d4045_0%,#23262a_70%,#17191c_100%)]",
        inkClass: "text-white",
      },
      {
        name: "glowie",
        domain: "glowie.example",
        wide: true,
        alt: "コスメブランド glowie のストア画面",
        tagline: "Beauty Essentials",
        bgClass: "bg-[linear-gradient(150deg,#d22b3a_0%,#b01225_60%,#8e0e1e_100%)]",
        inkClass: "text-white",
      },
    ],
  },
  {
    tab: "オンラインでも、実店舗でも。",
    merchants: [
      {
        name: "Homari",
        domain: "homari.example",
        wide: false,
        alt: "クッション・ファブリック雑貨ブランド Homari のストア画面（モバイル表示）",
        tagline: "Comfort Goods",
        bgClass: "bg-[linear-gradient(180deg,#e8ddcf_0%,#d8c8b2_60%,#bfa98e_100%)]",
        inkClass: "text-[#4a3c2c]",
      },
      {
        name: "Claypath",
        domain: "claypath.example",
        wide: true,
        alt: "陶磁器ブランド Claypath のストア画面",
        tagline: "Handmade Ceramics",
        bgClass: "bg-[linear-gradient(155deg,#b3674a_0%,#8e4d36_55%,#5f3324_100%)]",
        inkClass: "text-[#f4e8de]",
      },
      {
        name: "Kissaten",
        domain: "kissaten.example",
        wide: true,
        alt: "コーヒー器具ストア Kissaten のストア画面",
        tagline: "Coffee Brewing Gear",
        bgClass: "bg-[linear-gradient(160deg,#3a2a1e_0%,#241a12_60%,#15100b_100%)]",
        inkClass: "text-[#e9d9c2]",
      },
    ],
  },
  {
    tab: "AI や SNS でも。",
    merchants: [
      {
        name: "Voyara",
        domain: "voyara.example",
        wide: true,
        alt: "スーツケースブランド Voyara のストア画面",
        tagline: "Travel Gear",
        bgClass: "bg-[linear-gradient(150deg,#27435f_0%,#1a2f44_55%,#101d2b_100%)]",
        inkClass: "text-[#dce8f4]",
      },
      {
        name: "Tundra Co.",
        domain: "tundra.example",
        wide: false,
        alt: "ボトルブランド Tundra Co. のストア画面（モバイル表示）",
        tagline: "Drinkware",
        bgClass: "bg-[linear-gradient(180deg,#1f4d3a_0%,#143527_65%,#0b211a_100%)]",
        inkClass: "text-[#d8efe2]",
      },
      {
        name: "Mochiko",
        domain: "mochiko.example",
        wide: true,
        alt: "デザイン雑貨ブランド Mochiko のストア画面",
        tagline: "Playful Objects",
        bgClass: "bg-[linear-gradient(150deg,#8f7bd8_0%,#6d58b8_55%,#4a3a85_100%)]",
        inkClass: "text-white",
      },
    ],
  },
  {
    tab: "国内でも、海外でも。",
    merchants: [
      {
        name: "Sumika",
        domain: "sumika.example",
        wide: true,
        alt: "テーブルウェアブランド Sumika のストア画面",
        tagline: "Tableware",
        bgClass: "bg-[linear-gradient(155deg,#8b9b8a_0%,#67786a_55%,#48564c_100%)]",
        inkClass: "text-[#f0f2ec]",
      },
      {
        name: "Finchley",
        domain: "finchley.example",
        wide: false,
        alt: "アパレルブランド Finchley のストア画面（モバイル表示）",
        tagline: "Tailored Apparel",
        bgClass: "bg-[linear-gradient(180deg,#2c3550_0%,#1e2438_65%,#141828_100%)]",
        inkClass: "text-[#e3e7f2]",
      },
      {
        name: "Yorulin",
        domain: "yorulin.example",
        wide: true,
        alt: "寝具ブランド Yorulin のストア画面",
        tagline: "Bedding & Linen",
        bgClass: "bg-[linear-gradient(150deg,#5a6e9e_0%,#3f4f78_55%,#2a3554_100%)]",
        inkClass: "text-[#e9eef8]",
      },
    ],
  },
];

/** 画像生成までの暫定 CSS モック（spec §5 (a)）: gradient 背景 + 架空 wordmark + ダミー nav 帯 */
function MerchantCard({ merchant, interactive }: { merchant: Merchant; interactive: boolean }) {
  return (
    <a
      href={`https://${merchant.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={interactive ? 0 : -1}
      className={`group relative block h-[196px] shrink-0 overflow-hidden rounded-[5px] [mask-image:radial-gradient(white,black)] sm:h-[310px] md:h-[380px] ${
        merchant.wide ? "aspect-[1046/800]" : "aspect-[454/800]"
      }`}
    >
      <span
        role="img"
        aria-label={merchant.alt}
        className={`relative flex h-full w-full flex-col ${merchant.bgClass} ${merchant.inkClass}`}
      >
        {/* 写真の照り返しを模した highlight */}
        <span
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(70%_55%_at_68%_28%,rgba(255,255,255,0.16),transparent_70%)]"
        />
        {/* ダミー nav 帯 */}
        <span className="relative flex items-center justify-between px-4 pt-3 text-[10px] font-medium tracking-[0.22em] uppercase opacity-80 md:px-5 md:pt-4 md:text-[11px]">
          <span>{merchant.name}</span>
          {merchant.wide && (
            <span className="hidden gap-3 md:flex">
              <span>Shop</span>
              <span>About</span>
              <span>Cart</span>
            </span>
          )}
        </span>
        {/* 大型 wordmark */}
        <span
          className={`relative flex flex-1 items-center justify-center px-3 text-center font-semibold tracking-tight ${
            merchant.wide ? "text-[28px] md:text-[54px]" : "text-[16px] md:text-[26px]"
          }`}
        >
          {merchant.name}
        </span>
        {/* 下帯: tagline + ダミー CTA */}
        <span
          className={`relative mb-3 flex items-center px-4 text-[9px] tracking-[0.18em] uppercase opacity-70 md:mb-4 md:px-5 md:text-[10px] ${
            merchant.wide ? "justify-between" : "justify-center"
          }`}
        >
          <span>{merchant.tagline}</span>
          {merchant.wide && (
            <span className="rounded-full border border-current px-2 py-0.5 md:px-3 md:py-1">Shop now</span>
          )}
        </span>
      </span>
      {/* hover overlay: #061A1C(bg-sp-green) 300ms fade + 架空ドメインリンク（spec §2-2 確定挙動） */}
      {/* TODO(measure): overlay の透過度（暫定 85%） */}
      <span className="absolute inset-0 flex items-end justify-center bg-sp-green/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute bottom-4 text-[16px] font-normal text-white">{merchant.domain}</span>
      </span>
    </a>
  );
}

export function SpMerchantShowcase() {
  const reduced = useReducedMotion();
  // 自動送り: in-view のみ作動 / reduced-motion で停止 / select() で interval リセット（hooks 側で担保）
  const { ref: cycleRef, index: active, select } = useAutoCycle<HTMLDivElement>(
    MERCHANT_PANELS.length,
    AUTO_CYCLE_MS,
  );

  // stride = panel 幅(container 幅) + gap 90px（spec §1: 1245 + 90 = 1335 @1425 ≒ 1260 + 90 @1440）
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [stride, setStride] = useState(1350);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => { setStride(el.clientWidth + PANEL_GAP_PX); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, []);

  const onTabKeyDown = (e: KeyboardEvent<HTMLSpanElement>, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(i);
    }
  };

  return (
    // 縦リズム: 見出し 192px(3行×64) + gap 64px + カルーセル 380px + pb 80px = 716px @1440（本家実測: カード帯 y=256-636 / 高さ 380）
    <SpSection id="02-logos" bg="dark" className="overflow-hidden pb-16 md:pb-20">
      <div ref={cycleRef}>
        {/* 見出し tablist: 4 文がインライン連結で折返し（@1440 で 3 行） */}
        {/* TODO(measure): font-size 55px / weight 330 は他 section からの推定（spec §2-1） */}
        <SpContainer>
          <div
            role="tablist"
            aria-label="販売チャネル別の事例を見る"
            // 本家見出しは palt 無効（全角句読点フル幅 + 文間スペース。shopify.css のグローバル palt を打ち消す）
            className="text-[34px] leading-[1.16] font-[330] [font-feature-settings:normal] sm:text-balance md:text-[55px] md:leading-[64px]"
          >
            {MERCHANT_PANELS.map((panel, i) => (
              <Fragment key={panel.tab}>
                <span
                  id={`sp-merchant-tab-${String(i)}`}
                  role="tab"
                  aria-selected={active === i}
                  aria-controls={`sp-merchant-panel-${String(i)}`}
                  tabIndex={0}
                  onClick={() => { select(i); }}
                  onKeyDown={(e) => { onTabKeyDown(e, i); }}
                  // 非 active 色 = #71717a [verified 本家 screenshot 実測 rgb(113,113,122)]
                  // TODO(measure): 本家 hover は gradient reveal の可能性。暫定で白 80% に明度シフト
                  className={`cursor-pointer transition-colors duration-300 ${
                    active === i ? "text-white" : "text-[#71717a] hover:text-white/80"
                  }`}
                >
                  {panel.tab}
                </span>
                {/* 本家は文間に半角スペース（screenshot 実測: 「しましょう。 オンライン」間に空き） */}
                {i < MERCHANT_PANELS.length - 1 && " "}
              </Fragment>
            ))}
          </div>
        </SpContainer>

        {/* タブ連動カルーセル */}
        <SpContainer className="mt-10 md:mt-16">
          <div ref={viewportRef}>
            <motion.div
              className="flex items-start gap-x-[90px]"
              animate={{ x: -active * stride }}
              // TODO(measure): スライド duration/easing（推定 700ms ease-in-out、spec §4-2）
              transition={reduced ? { duration: 0 } : { duration: 0.7, ease: "easeInOut" }}
            >
              {MERCHANT_PANELS.map((panel, i) => (
                <div
                  key={panel.tab}
                  id={`sp-merchant-panel-${String(i)}`}
                  role="tabpanel"
                  aria-labelledby={`sp-merchant-tab-${String(i)}`}
                  aria-hidden={active !== i}
                  // TODO(measure): lg での pointer drag 可否（現状 cursor-grab の見た目のみ、モバイルは横スクロール）
                  className="flex w-full shrink-0 cursor-grab items-start gap-x-4 active:cursor-grabbing max-lg:overflow-x-auto max-lg:[scrollbar-width:none]"
                >
                  {panel.merchants.map((merchant) => (
                    <MerchantCard key={merchant.domain} merchant={merchant} interactive={active === i} />
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </SpContainer>
      </div>
    </SpSection>
  );
}
