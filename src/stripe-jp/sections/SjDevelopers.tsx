import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import "./SjDevelopers.css";

/* ════════════════════════════════════════════════════════════════
   §6 開発者（唯一の dark section）「あらゆる技術スタックに、信頼と拡張性を。」
   DOM: stripe-jp-dom.html offset 540,915–616,775 / spec: 00-section-map §6, 01-motion-spec §6
   ════════════════════════════════════════════════════════════════ */

const WAVE_SRC =
  "https://images.stripeassets.com/fzn2n1nzq965/1lk5Hfstc9dnE8xVFz1HeC/0dec8f2dde7f904eade36d8390d81c69/developer-wave-wide_2x.png";
const QR_SRC =
  "https://images.stripeassets.com/fzn2n1nzq965/2AQaqFVlwXgXxBRIwIp9ry/c597bf42bd93eef022cbc6933c0d7cbc/QRCode.png?w=140&q=90";

/* ---------- 共通: hover arrow（hds-icon-hover-arrow 再現） ---------- */

function HoverArrow() {
  return (
    <svg
      className="sjd-arrow"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path className="sjd-arrow-line" d="M0.5 5.5h7" />
      <path className="sjd-arrow-tip" d="M1.5 1.5l4 4-4 4" />
    </svg>
  );
}

/* ---------- §6a 構成図: ジオメトリ（viewBox 1000×440、% 配置で responsive） ---------- */

const FIG_W = 1000;
const FIG_H = 440;

function nodeStyle(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    left: `${String(((x - w / 2) / FIG_W) * 100)}%`,
    top: `${String(((y - h / 2) / FIG_H) * 100)}%`,
    width: `${String((w / FIG_W) * 100)}%`,
    height: `${String((h / FIG_H) * 100)}%`,
  };
}

/* 基底の dashed 配線（DOM: stroke #152460 dasharray 2 2 の暗線） */
const BASE_PATHS: readonly string[] = [
  // systems → SDK / イベント送信先（elbow）
  "M310 56 L310 99 Q310 104 315 104 L317 104 Q322 104 322 109 L322 120",
  "M372 56 L372 96 Q372 104 364 104 L348 104 Q340 104 340 112 L340 120",
  "M470 56 L470 174",
  "M580 56 L580 96 Q580 104 588 104 L612 104 Q620 104 620 112 L620 120",
  "M672 56 L672 99 Q672 104 667 104 L665 104 Q660 104 660 109 L660 120",
];

/* 明色パルスを流す幹線（DOM: stroke #5D64FE の animated path） */
const TRUNK_PATHS: readonly string[] = [
  "M330 152 L330 212 Q330 220 338 220 L454 220", // SDK → stripe
  "M640 152 L640 212 Q640 220 632 220 L546 220", // イベント送信先 → stripe
  "M173 220 L225 220", // apps → App Marketplace
  "M375 220 L454 220", // App Marketplace → stripe
  "M546 220 L630 220", // stripe → Data Pipeline
  "M750 220 L893 220", // Data Pipeline → 右 app
  "M500 266 L500 314", // stripe → オーケストレーション
];

/* psp-connection-path（4 本 fan、DOM: stroke #5D64FE dasharray 120） */
const PSP_FAN_PATHS: readonly string[] = [
  "M480 346 L480 356 Q480 364 472 364 L448 364 Q440 364 440 372 L440 394",
  "M492 346 L492 364 Q492 372 484 372 L481 372 Q473 372 473 380 L473 394",
  "M508 346 L508 364 Q508 372 516 372 L519 372 Q527 372 527 380 L527 394",
  "M520 346 L520 356 Q520 364 528 364 L552 364 Q560 364 560 372 L560 394",
];

interface SystemPill { label: string; x: number; w: number }

const SYSTEM_PILLS: readonly SystemPill[] = [
  { label: "ERP", x: 310, w: 52 },
  { label: "CRM", x: 372, w: 52 },
  { label: "サブスクリプション", x: 470, w: 110 },
  { label: "レガシー請求", x: 580, w: 88 },
  { label: "予約システム", x: 672, w: 88 },
];

/* ---------- §6a app logo flip（front/back ×7。ブランド SVG は色 tile + initial で簡略再現） ---------- */

interface AppFace { bg: string; fg: string; label: string }
interface AppTile { front: AppFace; back: AppFace }

const LEFT_APPS: readonly AppTile[] = [
  {
    front: { bg: "#00a1e0", fg: "#fff", label: "sf" },
    back: { bg: "#ffe01b", fg: "#000", label: "M" },
  },
  {
    front: { bg: "#4b53bc", fg: "#fff", label: "T" },
    back: { bg: "#ff5c35", fg: "#fff", label: "H" },
  },
  {
    front: { bg: "#1b6cb5", fg: "#fff", label: "SAP" },
    back: { bg: "#ffffff", fg: "#611f69", label: "S" },
  },
  {
    front: { bg: "#fa0f00", fg: "#fff", label: "A" },
    back: { bg: "#03363d", fg: "#fff", label: "Z" },
  },
  {
    front: { bg: "#c74634", fg: "#fff", label: "O" },
    back: { bg: "#ffffff", fg: "#000", label: "N" },
  },
  {
    front: { bg: "#125580", fg: "#fff", label: "NS" },
    back: { bg: "#236cff", fg: "#fff", label: "int" },
  },
];

const RIGHT_APP: AppTile = {
  front: { bg: "#29b5e8", fg: "#fff", label: "❅" },
  back: { bg: "#ff3621", fg: "#fff", label: "◆" },
};

function FlipTile({ tile, flipped }: { tile: AppTile; flipped: boolean }) {
  return (
    <motion.div
      className="sjd-applogo"
      animate={{ rotateX: flipped ? 180 : 0 }}
      transition={{ duration: 0.7, ease: [0.45, 0.05, 0.55, 0.95] }}
    >
      <div
        className="sjd-applogo-face"
        style={{ background: tile.front.bg, color: tile.front.fg }}
      >
        {tile.front.label}
      </div>
      <div
        className="sjd-applogo-face sjd-applogo-back"
        style={{ background: tile.back.bg, color: tile.back.fg }}
      >
        {tile.back.label}
      </div>
    </motion.div>
  );
}

/* ---------- §6a PSP 多言語ラベル（psp-jp / psp-br / psp-th の入替り） ---------- */

const PSP_LABELS: readonly string[] = [
  "決済代行業者",
  "Facilitador de Pagamento",
  "ผู้ให้บริการชำระเงิน",
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function SystemsDiagram() {
  const [flips, setFlips] = useState<readonly boolean[]>(() =>
    Array.from({ length: 7 }, (_, i) => i === 0)
  );
  const [pspIndex, setPspIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let tick = 0;
    const flipId = window.setInterval(() => {
      setFlips((prev) => {
        const next = [...prev];
        const idx = tick % next.length;
        next[idx] = !next[idx];
        return next;
      });
      tick += 1;
    }, 2400);
    const pspId = window.setInterval(() => {
      setPspIndex((i) => (i + 1) % PSP_LABELS.length);
    }, 3200);
    return () => {
      window.clearInterval(flipId);
      window.clearInterval(pspId);
    };
  }, []);

  return (
    <figure className="sjd-figure mt-14">
      <figcaption className="sr-only">
        Stripe が 5 つの連携方法 (SDK、イベント送信先、App
        Marketplace、データパイプライン、オーケストレーション) を通じて、ERP、CRM、サブスクリプションなどのビジネスシステムとどのように連携するかを示すインタラクティブな図です。
      </figcaption>

      <div className="sjd-dotgrid" aria-hidden="true" />

      {/* 配線 */}
      <svg
        className="sjd-diagram-svg"
        viewBox={`0 0 ${String(FIG_W)} ${String(FIG_H)}`}
        fill="none"
        aria-hidden="true"
      >
        {/* 中央水平 dashed line（center-path-svg: M1000 194H0 相当） */}
        <path className="sjd-line sjd-line--center" d="M0 220 L1000 220" />
        {BASE_PATHS.map((d) => (
          <path key={d} className="sjd-line" d={d} />
        ))}
        {TRUNK_PATHS.map((d) => (
          <path key={d} className="sjd-line" d={d} />
        ))}
        {PSP_FAN_PATHS.map((d) => (
          <path key={d} className="sjd-line" d={d} />
        ))}
        {/* dash flow パルス */}
        {TRUNK_PATHS.map((d, i) => (
          <path
            key={`p-${d}`}
            className="sjd-pulse"
            d={d}
            pathLength={100}
            style={{ animationDelay: `${String(i * 0.45)}s` }}
          />
        ))}
        {PSP_FAN_PATHS.map((d, i) => (
          <path
            key={`p-${d}`}
            className="sjd-pulse"
            d={d}
            pathLength={100}
            style={{ animationDelay: `${String(1.2 + i * 0.3)}s` }}
          />
        ))}
      </svg>

      {/* 上段: ビジネスシステム pill ×5 */}
      {SYSTEM_PILLS.map((pill) => (
        <div key={pill.label} className="sjd-node" style={nodeStyle(pill.x, 40, pill.w, 32)}>
          {pill.label}
        </div>
      ))}

      {/* 中段: 連携方法 block（dynamic-rect-bg = shimmer 明色） */}
      <div className="sjd-node sjd-node--bright" style={nodeStyle(330, 136, 56, 32)}>
        SDK
      </div>
      <div className="sjd-node sjd-node--bright" style={nodeStyle(640, 136, 120, 32)}>
        イベント送信先
      </div>

      {/* 左 app logo cluster（front/back flip ×6） */}
      <div className="sjd-apps" style={nodeStyle(105, 220, 136, 88)} aria-hidden="true">
        {LEFT_APPS.map((tile, i) => (
          <div key={tile.front.label} className="sjd-applogo-wrap aspect-square">
            <FlipTile tile={tile} flipped={flips[i] ?? false} />
          </div>
        ))}
      </div>

      <a
        className="sjd-node sjd-node--bright gap-1.5"
        style={nodeStyle(300, 220, 150, 34)}
        href="https://marketplace.stripe.com/"
      >
        App Marketplace
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="M4.5 1.5H2A1.5 1.5 0 0 0 .7 3v7A1.5 1.5 0 0 0 2 11.3h7A1.5 1.5 0 0 0 10.3 10V7.5" />
          <path d="M7 1h4v4" />
          <path d="M11 1L5.5 6.5" />
        </svg>
      </a>

      {/* 中央 stripe block */}
      <div className="sjd-stripe-block" style={nodeStyle(500, 220, 92, 92)} aria-hidden="true">
        stripe
      </div>

      <div className="sjd-node sjd-node--bright" style={nodeStyle(690, 220, 120, 32)}>
        Data Pipeline
      </div>

      {/* 右 app（data warehouse） */}
      <div className="sjd-applogo-wrap" style={{ ...nodeStyle(915, 220, 44, 44), position: "absolute" }} aria-hidden="true">
        <FlipTile tile={RIGHT_APP} flipped={flips[6] ?? false} />
      </div>

      {/* 下段: オーケストレーション → 決済代行業者 */}
      <div className="sjd-node sjd-node--bright" style={nodeStyle(500, 330, 130, 32)}>
        オーケストレーション
      </div>

      <div className="sjd-node overflow-hidden" style={nodeStyle(500, 412, 150, 36)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={pspIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="px-1 text-[10.5px]"
          >
            {PSP_LABELS[pspIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </figure>
  );
}

/* ---------- §6b スケール数値 ---------- */

interface ScaleStat { value: string; label: string; tone: "orange" | "pink" | "purple" }

const SCALE_STATS: readonly ScaleStat[] = [
  { value: "5億 +", label: "API リクエスト数 (毎日)", tone: "orange" },
  { value: "1万 +", label: "API リクエスト数 (毎秒)", tone: "pink" },
  { value: "15万 +", label: "取引数 (毎分)", tone: "purple" },
];

/* ---------- §6c card 1: no-code（chat + 決済リンク + QR） ---------- */

function NoCodeCard() {
  return (
    <div
      className="sjd-card sjd-card--nocode flex gap-3 p-5"
      role="img"
      aria-label="シンプルなデイクリームの投稿を求める潜在顧客とのチャットによる会話。企業は「純粋なグロークリーム」を購入するための決済用リンクで応答します。右側には、同じ決済用リンクにリダイレクトされる QR コードがあります。"
    >
      <div className="flex w-[55%] flex-col justify-start rounded-xl bg-white p-3 shadow-lg" aria-hidden="true">
        <div className="flex flex-col gap-2">
          <div className="max-w-[88%] self-start rounded-[10px] rounded-bl-[3px] bg-[#ebeef4] px-2.5 py-2 text-[11px] leading-snug text-[#30313d]">
            SPF 配合のシンプルなデイクリームをお探しですか？
          </div>
          <div className="max-w-[88%] self-end rounded-[10px] rounded-br-[3px] border border-[#e6e9f0] bg-white px-2.5 py-2 text-[11px] leading-snug text-[#30313d]">
            それでしたら、ピュアグロークリームをおすすめします。
          </div>
          <div className="max-w-[88%] self-end rounded-[10px] rounded-br-[3px] border border-[#e6e9f0] bg-white px-2.5 py-2 text-[11px] leading-snug">
            <span className="break-all font-medium text-[#635bff]">
              https://buy.stripe.com/test_eVa3do41l...
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center rounded-xl bg-white px-3 py-4 text-center shadow-lg"
        aria-hidden="true"
      >
        <p className="text-[10px] font-medium text-[#6a7383]">ピュアグロークリーム</p>
        <p className="mt-0.5 text-[16px] font-semibold tabular-nums text-[#1a1b25]">￥3,000</p>
        <img src={QR_SRC} alt="" width={70} height={66} loading="lazy" className="mt-2" />
        <p className="mt-2 text-[9px] text-[#6a7383]">スキャンして支払う</p>
      </div>
    </div>
  );
}

/* ---------- §6c card 2: 連携プラットフォーム logo grid（5/6/5 の 3 行） ---------- */

interface PlatformTile { bg: string; fg: string; label: string }

/* tile 色は DOM の rect fill 実値（glyph は initial で簡略化） */
const PLATFORM_ROWS: readonly (readonly PlatformTile[])[] = [
  [
    { bg: "#5000fe", fg: "#fff", label: "Z" },
    { bg: "#ffffff", fg: "#1a1a1a", label: "Sq" },
    { bg: "#873eff", fg: "#fff", label: "Woo" },
    { bg: "#ffffff", fg: "#95bf47", label: "S" },
    { bg: "#e81c1c", fg: "#fff", label: "Ls" },
  ],
  [
    { bg: "#6142d3", fg: "#fff", label: "B" },
    { bg: "#ffffff", fg: "#000", label: "wix" },
    { bg: "#ff5c35", fg: "#fff", label: "H" },
    { bg: "#146ef5", fg: "#fff", label: "W" },
    { bg: "#ffffff", fg: "#0a1551", label: "J" },
    { bg: "#09cfc2", fg: "#fff", label: "" },
  ],
  [
    { bg: "#fcfbf9", fg: "#5a86f2", label: "P" },
    { bg: "#2bb77b", fg: "#fff", label: "≡" },
    { bg: "#ffffff", fg: "#05d0e0", label: "m" },
    { bg: "#6138d8", fg: "#fff", label: "◎" },
    { bg: "#ffffff", fg: "#002ed3", label: "XC" },
  ],
];

function PlatformsCard() {
  return (
    <div
      className="sjd-card sjd-card--platforms flex flex-col items-center justify-center gap-2.5"
      role="img"
      aria-label="ダークブルーの背景に設定された、さまざまなオンラインプラットフォームやサービスを表すロゴのグリッド。"
    >
      {PLATFORM_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-2.5" aria-hidden="true">
          {row.map((tile, ti) => (
            <div
              key={`${String(ri)}-${String(ti)}`}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[12px] font-bold shadow-md"
              style={{ background: tile.bg, color: tile.fg }}
            >
              {tile.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- §6c card 3: code editor（integrated-code-graphic、typing アニメは実測未確定のため静的） ---------- */

function CodeLine({ n, children }: { n: number; children?: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-3 shrink-0 select-none text-right text-[#5b679f]">{n}</span>
      <div className="whitespace-pre">{children}</div>
    </div>
  );
}

interface AutocompleteItem { label: string; active: boolean }

const AUTOCOMPLETE_ITEMS: readonly AutocompleteItem[] = [
  { label: "accountLinks", active: false },
  { label: "accounts", active: false },
  { label: "applePayDomains", active: true },
  { label: "applicationFees", active: false },
  { label: "balances", active: false },
];

function CodeEditorCard() {
  return (
    <div
      className="sjd-card sjd-card--code flex flex-col font-mono text-[11px] leading-[1.7]"
      role="img"
      aria-label="テスト API キーを使用して Stripe ライブラリを初期化し、さまざまな Stripe 関数を一覧表示する JavaScript コード。以下は、サーバーが実行中でリクエストを待っていることを示す端末のメッセージです。"
    >
      <div className="relative flex-1 px-3 pt-3" aria-hidden="true">
        <CodeLine n={1}>
          <span className="text-[#e3e8ff]">const stripe = require(</span>
          <span className="text-[#f5be58]">'stripe'</span>
          <span className="text-[#e3e8ff]">)(</span>
        </CodeLine>
        <CodeLine n={2}>
          <span className="text-[#f5be58]">{"  'sk_test_abc123'"}</span>
        </CodeLine>
        <CodeLine n={3}>
          <span className="text-[#e3e8ff]">);</span>
        </CodeLine>
        <CodeLine n={4}>
          <span className="text-[#c58fff]">await</span>
          <span className="text-[#e3e8ff]"> stripe.</span>
        </CodeLine>
        <CodeLine n={5} />
        <CodeLine n={6} />
        {/* code-autocomplete dropdown */}
        <div className="absolute left-[104px] top-[86px] z-10 w-[150px] rounded-md border border-[#3a45a0] bg-[#222b73] py-1 text-[10.5px] leading-[1.8] shadow-xl">
          {AUTOCOMPLETE_ITEMS.map((item) => (
            <div
              key={item.label}
              className={
                item.active
                  ? "bg-[#4f5be8] px-2.5 text-white"
                  : "px-2.5 text-[#aeb6e8]"
              }
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
      {/* vim 風 statusbar */}
      <div
        className="flex items-center justify-between bg-[#2a3375] px-2 py-1 text-[9.5px] text-[#c6cdf5]"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-[3px] bg-[#9aaeff] px-1.5 py-0.5 font-semibold text-[#101848]">
            NORMAL
          </span>
          <span>server.js</span>
        </div>
        <div>100% ≡ 6/6 ln : 4</div>
      </div>
      {/* terminal */}
      <div className="bg-[#0d1440] px-3 py-2.5" aria-hidden="true">
        <p className="text-[#d6dcff]">$ node server.js &amp;&amp; stripe listen</p>
        <p className="text-[#8ee6b8]">&gt; Ready! Waiting for requests...</p>
      </div>
    </div>
  );
}

/* ---------- §6c feature card 共通枠 ---------- */

interface FeatureDetail {
  graphic: ReactNode;
  title: string;
  body: string;
  linkLabel: string;
  href: string;
}

function FeatureDetailBlock({ graphic, title, body, linkLabel, href }: FeatureDetail) {
  return (
    <div>
      {graphic}
      <div className="mt-5 text-[15px] leading-relaxed">
        <h4 className="inline font-semibold text-white">{title}</h4>{" "}
        <p className="inline text-white/55">{body}</p>
      </div>
      <div className="mt-3">
        <a className="sjd-link" href={href}>
          {linkLabel}
          <HoverArrow />
        </a>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */

export function SjDevelopers() {
  return (
    <section className="sjd py-24">
      <div className="sj-container">
        {/* ── section header ── */}
        <div className="max-w-[760px]">
          <h2 className="sjd-h2 inline text-white">
            あらゆる技術スタックに、信頼と拡張性を。
          </h2>{" "}
          <p className="sjd-h2 inline text-white/55">
            ビジネスのニーズに合わせて、Stripe を柔軟にカスタマイズできます。
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a className="sjd-btn sjd-btn--primary" href="https://docs.stripe.com/development">
            開発者ドキュメントを参照
            <HoverArrow />
          </a>
          <a className="sjd-btn sjd-btn--secondary" href="https://github.com/stripe">
            Stripe の GitHub を表示
          </a>
        </div>

        <div className="sjd-divider mt-12" aria-hidden="true" />

        {/* ── §6a 既存のシステムと接続 ── */}
        <div className="mt-14 max-w-[660px]">
          <h3 className="sjd-h3 inline text-white">既存のシステムと接続。</h3>{" "}
          <p className="sjd-h3 inline text-white/55">
            複数の決済代行業者をまたぐ決済のオーケストレーションや、カスタムワークフローの構築、API・パートナーアプリ・既存インテグレーションを通じたサードパーティ連携が可能です。
          </p>
        </div>
        <SystemsDiagram />

        <div className="sjd-divider my-16" aria-hidden="true" />

        {/* ── §6b 事業規模を確実に拡大 ── */}
        <div className="max-w-[660px]">
          <h3 className="sjd-h3 inline text-white">事業規模を確実に拡大。</h3>{" "}
          <p className="sjd-h3 inline text-white/55">
            ピーク時でも、毎秒数千件のトランザクションを安定した速度と高い信頼性で処理します。
          </p>
        </div>
        <div className="relative mt-8">
          {/* 自然寸法 2464×920 を明示 — lazy load 前の高さ崩壊（約391px）防止 */}
          <img
            src={WAVE_SRC}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={2464}
            height={920}
            className="h-auto w-full"
          />
          <div className="absolute inset-x-0 bottom-[5%] grid grid-cols-3 gap-8">
            {SCALE_STATS.map((stat) => (
              <div key={stat.label}>
                <h4 className={`sjd-stat sjd-stat--${stat.tone}`}>{stat.value}</h4>
                <p className="mt-1 text-[15px] text-[#9aa7d4]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sjd-divider my-16" aria-hidden="true" />

        {/* ── §6c インテグレーションの方法を選択 ── */}
        <div className="max-w-[660px]">
          <h3 className="sjd-h3 inline text-white">インテグレーションの方法を選択。</h3>{" "}
          <p className="sjd-h3 inline text-white/55">
            AI を活用したサポート、充実したドキュメント、組み込みのデバッグツールにより、ビジネスに最適な方法で導入を開始できます。
          </p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <FeatureDetailBlock
            graphic={<NoCodeCard />}
            title="ノーコードで利用開始。"
            body="請求の設定、対面決済、決済用リンクの共有を、コード不要で Stripe ダッシュボードから行うことができます。"
            linkLabel="ノーコードで始める"
            href="https://docs.stripe.com/no-code"
          />
          <FeatureDetailBlock
            graphic={<PlatformsCard />}
            title="連携プラットフォームを活用。"
            body="ウェブサイト構築ツールと Stripe の連携に対応したプラットフォームをご覧ください。"
            linkLabel="プラットフォーム一覧を表示"
            href="https://marketplace.stripe.com/"
          />
          <FeatureDetailBlock
            graphic={<CodeEditorCard />}
            title="独自の実装を構築。"
            body="SDK、API、MCP サーバー、AI 開発者ツールを活用し、Stripe との独自の連携を構築・運用できます。"
            linkLabel="詳細を表示"
            href="https://docs.stripe.com/development"
          />
        </div>
      </div>
    </section>
  );
}
