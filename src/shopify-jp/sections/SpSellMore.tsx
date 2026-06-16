import type { CSSProperties, ReactElement, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Brush, Check, LayoutGrid, Palette, Settings, Type, Wifi } from "lucide-react";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpSectionHeading } from "@/shopify-jp/ui/SpSectionHeading";
import { SpDarkCard } from "@/shopify-jp/ui/SpDarkCard";
import { SpCaptionBlock } from "@/shopify-jp/ui/SpCaptionBlock";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";
import { SpGlowEllipse } from "@/shopify-jp/ui/SpGlowEllipse";
import {
  useAutoCycle,
  useRevealInView,
  useStageTimeline,
} from "@/shopify-jp/ui/hooks";
import type { TimelineStage } from "@/shopify-jp/ui/hooks";

/* ============================================================
 * 04-sell-more — 「より多くの場所で、より多くの販売を」
 * 静的レイアウト + メディアループのみ（タブ/スクロール切替なし）。
 * 本家動画は CSS/DOM モックで置換（CDN 参照禁止・架空ブランド konoha 系）。
 * ============================================================ */

/* ---------- 大カード: ストア編集画面 DOM モック ---------- */

const EDITOR_PANELS = [
  { icon: Brush, label: "テーマ" },
  { icon: Palette, label: "カラー" },
  { icon: Type, label: "文字" },
  { icon: LayoutGrid, label: "セクション" },
  { icon: Settings, label: "設定" },
] as const;

/* phase 0: テーマ選択 → phase 1: 色変更 → phase 2: 公開 */
const EDITOR_ACCENTS = ["#2ee0a6", "#f0a35e", "#f0a35e"];
const EDITOR_ACTIVE_PANEL = [0, 1, 1];
const FALLBACK_ACCENT = "#2ee0a6";

const SWATCHES = ["#2ee0a6", "#f0a35e", "#7ab8ff", "#e57cae"];

function EditorShowcaseMock(): ReactElement {
  // TODO(measure): 本家は録画 video（1148×598 ループ）。位相の尺は未実測の仮値（2.7s ×3 ≒ 8s ループ）
  const { ref, index } = useAutoCycle<HTMLDivElement>(3, 2700);
  const accent = EDITOR_ACCENTS[index] ?? FALLBACK_ACCENT;
  const activePanel = EDITOR_ACTIVE_PANEL[index] ?? 0;
  const activeSwatch = index === 0 ? 0 : 1;
  const published = index === 2;
  const colorEase = { duration: 0.45, ease: "easeOut" } as const;

  return (
    <div
      ref={ref}
      aria-hidden
      className="flex h-[598px] w-full max-w-[1148px] flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-[#07191d]"
    >
      {/* toolbar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto rounded-full bg-white/5 px-4 py-1 text-[11px] text-white/50">
          konoha.shop — ストアエディター
        </span>
        <span className="text-[11px] text-white/40">下書き保存済み</span>
        <span className="rounded-full bg-white px-3.5 py-1 text-[11px] font-[550] text-black">
          公開する
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <div className="hidden w-[216px] shrink-0 flex-col gap-1 border-r border-white/[0.06] p-3 md:flex">
          <span className="px-2 pb-1 text-[10px] tracking-[0.14em] text-white/35">デザイン</span>
          {EDITOR_PANELS.map((panel, i) => (
            <span
              key={panel.label}
              className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-[12px] transition-colors duration-300 ${
                i === activePanel ? "bg-white/10 text-white" : "text-white/45"
              }`}
            >
              <panel.icon className="size-3.5" />
              {panel.label}
            </span>
          ))}
          <span className="mt-3 px-2 pb-1 text-[10px] tracking-[0.14em] text-white/35">
            ブランドカラー
          </span>
          <span className="flex gap-2 px-2">
            {SWATCHES.map((c, i) => (
              <motion.span
                key={c}
                className="size-5 rounded-full"
                style={{ backgroundColor: c }}
                animate={{
                  outline: i === activeSwatch ? "2px solid rgba(255,255,255,0.7)" : "2px solid rgba(255,255,255,0)",
                  outlineOffset: 2,
                }}
                transition={colorEase}
              />
            ))}
          </span>
        </div>

        {/* canvas: 架空ストア「konoha」プレビュー */}
        <div className="relative min-w-0 flex-1 p-5">
          <div className="flex h-full flex-col overflow-hidden rounded-md bg-[#0b2125] px-7 py-5">
            <div className="flex items-center justify-between pb-4">
              <span className="text-[14px] font-[550] tracking-[0.22em] text-white">konoha</span>
              <span className="flex gap-4 text-[10px] text-white/45">
                <span>新作</span>
                <span>コレクション</span>
                <span>ストーリー</span>
              </span>
            </div>
            {/* hero（accent が位相で変わる） */}
            <div className="relative h-[200px] shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: `linear-gradient(115deg, ${accent}3d 0%, ${accent}0a 45%, rgba(2,9,10,0) 75%)`,
                }}
                transition={colorEase}
              />
              <div className="relative flex h-full flex-col justify-center gap-3 px-7">
                <span className="text-[24px] leading-tight font-[330] text-white">
                  新作コレクション、
                  <br />
                  届きました。
                </span>
                <motion.span
                  className="w-fit rounded-full px-4 py-1.5 text-[11px] font-[550] text-black"
                  animate={{ backgroundColor: accent }}
                  transition={colorEase}
                >
                  今すぐ見る
                </motion.span>
              </div>
            </div>
            {/* product grid skeleton */}
            <div className="mt-4 grid flex-1 grid-cols-3 gap-4">
              {["#16383a", "#1d3035", "#28403c"].map((tile) => (
                <div key={tile} className="flex flex-col gap-2">
                  <div
                    className="min-h-0 flex-1 rounded-md"
                    style={{ background: `linear-gradient(160deg, ${tile} 0%, #0a1c20 90%)` }}
                  />
                  <span className="h-1.5 w-3/4 rounded bg-white/15" />
                  <span className="h-1.5 w-1/3 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          {/* 公開 toast（phase 2） */}
          <div className="pointer-events-none absolute bottom-9 left-1/2 -translate-x-1/2">
            <AnimatePresence>
              {published ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-[550] text-black shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                >
                  <Check className="size-4 text-[#067a4e]" />
                  ストアを公開しました
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- サブカード media 1: チャネル接続グラフ（録画解析 2026-06-11 反映）---------- */

/* アイコン定義（自作グリフ・本家ロゴ不使用） */

/** 白タイル wrapper — 丸型（上段用） */
function WhiteTileRound({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex size-[46px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      {children}
    </div>
  );
}

/** 白タイル wrapper — 角丸型（下段用） */
function WhiteTileRect({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex size-[46px] items-center justify-center rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      {children}
    </div>
  );
}

/** 赤系丸タイル — P グリフ（Pinterest 相当） */
function IconPinterest(): ReactElement {
  return (
    <WhiteTileRound>
      <span className="text-[18px] font-bold leading-none text-[#E0484E]">P</span>
    </WhiteTileRound>
  );
}

/** ピンク〜橙グラデ丸タイル — カメラ型（Instagram 相当） */
function IconInstagram(): ReactElement {
  return (
    <WhiteTileRound>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {/* カメラ外形（グラデ塗り） */}
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#fcaf45" />
            <stop offset="40%" stopColor="#f77737" />
            <stop offset="80%" stopColor="#e1306c" />
          </radialGradient>
        </defs>
        <rect x="2" y="4" width="16" height="13" rx="3.5" fill="url(#ig-grad)" />
        <circle cx="10" cy="10.5" r="3" fill="white" opacity="0.15" />
        <circle cx="10" cy="10.5" r="3" stroke="white" strokeWidth="1.6" />
        <circle cx="14.2" cy="5.8" r="1" fill="white" />
      </svg>
    </WhiteTileRound>
  );
}

/** 青系丸タイル — G グリフ（Google 相当） */
function IconGoogle(): ReactElement {
  return (
    <WhiteTileRound>
      <span className="text-[18px] font-bold leading-none text-[#4285F4]">G</span>
    </WhiteTileRound>
  );
}

/** 白タイル 4 分割 — マルチカラー（eBay 相当） */
function IconEbay(): ReactElement {
  return (
    <WhiteTileRect>
      <div className="size-[28px] overflow-hidden rounded-sm">
        <div className="grid h-full grid-cols-2 grid-rows-2">
          <span className="bg-[#E53238]" />
          <span className="bg-[#0064D2]" />
          <span className="bg-[#F5AF02]" />
          <span className="bg-[#86B817]" />
        </div>
      </div>
    </WhiteTileRect>
  );
}

/** 白タイル + 音符グリフ（TikTok 相当） */
function IconTiktok(): ReactElement {
  return (
    <WhiteTileRect>
      <svg width="18" height="20" viewBox="0 0 16 18" fill="none">
        <path
          d="M11 1c.3 2 1.8 3.3 4 3.5v2.8c-1.4 0-2.7-.4-4-.9V13a5 5 0 1 1-5-5c.3 0 .7 0 1 .1V11a2.3 2.3 0 1 0 1.6 2.2V1h2.4Z"
          fill="#010101"
        />
      </svg>
    </WhiteTileRect>
  );
}

/** 白タイル + a グリフ（Amazon 相当） */
function IconAmazon(): ReactElement {
  return (
    <WhiteTileRect>
      <span className="text-[18px] font-bold leading-none text-[#1a1f2c]">a</span>
    </WhiteTileRect>
  );
}

/** 白タイル + 赤い再生ボタン（YouTube 相当） */
function IconYoutube(): ReactElement {
  return (
    <WhiteTileRect>
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
        <rect x="0" y="0" width="22" height="16" rx="4" fill="#FF0000" />
        <polygon points="8,3 18,8 8,13" fill="white" />
      </svg>
    </WhiteTileRect>
  );
}

/**
 * 中央の大型ショッピングバッグ（konoha 配色の自作イラスト）。
 * 本家の主役要素はカード幅の ≈23% を占める立体的なバッグ → 同スケール・同存在感で再現。
 * 形状・配色は汎用のショッピングバッグ + "k"（本家ロゴの複製ではない）。
 */
function KonohaBagLogo(): ReactElement {
  return (
    <svg viewBox="0 0 105 125" fill="none" className="w-full drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]">
      <defs>
        <linearGradient id="sp04-bag-body" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#3ee89b" />
          <stop offset="55%" stopColor="#1fbf76" />
          <stop offset="100%" stopColor="#0f8f56" />
        </linearGradient>
        <linearGradient id="sp04-bag-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* ハンドル（本体の背面） */}
      <path
        d="M33 40 Q33 12 52.5 12 Q72 12 72 40"
        stroke="#0d7a49"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* 本体: 上辺が広く下がやや窄まる台形 + 角丸 */}
      <path
        d="M13 36 L92 36 L86.5 113 Q86 121 77 121 L28 121 Q19 121 18.5 113 Z"
        fill="url(#sp04-bag-body)"
      />
      {/* 口元の内側シャドウ（バッグの「口」を示す） */}
      <path d="M13 36 L92 36 L91.4 44 L13.6 44 Z" fill="rgba(4,30,24,0.28)" />
      {/* 斜めの光沢シーン */}
      <path d="M13 36 L52 36 L30 121 L19.5 113 Z" fill="url(#sp04-bag-sheen)" />
      {/* k グリフ */}
      <text
        x="52.5"
        y="92"
        textAnchor="middle"
        fontSize="44"
        fontWeight="700"
        fontFamily="'Noto Sans JP', sans-serif"
        fill="#FFFFFF"
      >
        k
      </text>
    </svg>
  );
}

/**
 * 接続線 SVG — 樹形トポロジー（spec-s04-card1-click.md §① 実測）。
 * viewBox = 454px カード幅基準の絶対座標。
 *
 * 構造:
 *   ロゴ下端(227, 294) → 縦幹 → 第1水平横線(y=350, x=64〜391)
 *     → 上段3本(x=116/227/341, y=350→458)
 *     → 第2水平横線(y=420, x=62〜396)
 *       → 下段4本(x=62/173/285/396, y=420→511)
 *
 * 全線 rgba(255,255,255,0.10)・1px 固定。
 */
/*
 * 座標系: viewBox = 500 × 560（元 454×530 に左右 +23/+23 の余白を加算）。
 * 全 x 値を +23 シフトしているため、左端アイコン中心 x=85 は viewBox の 17%
 * → アイコン半幅 23px を引いても viewBox 内に収まる。
 *
 * 元 x → シフト後 x （+23 加算）:
 *   幹/中央 227 → 250
 *   上段 116/227/341 → 139/250/364
 *   下段  62/173/285/396 → 85/196/308/419
 *   横線端 64/391 → 87/414   62/396 → 85/419
 */
function ConnectionLines(): ReactElement {
  const S = "rgba(255,255,255,0.10)";
  const SW = 1;
  const cx = 250;          // 幹中心 x（元 227 + 23）
  /* 樹形分岐 y 座標（元と同じ、viewBox 高 +30 でアイコン下端に余裕） */
  const trunkTopY = 294;
  const h1Y = 350;
  const h2Y = 420;
  /* 上段アイコン中心 x (+23 シフト) */
  const topXs: number[] = [139, 250, 364];
  const topIconY = 458;
  /* 下段アイコン中心 x (+23 シフト) */
  const botXs: number[] = [85, 196, 308, 419];
  const botIconY = 511;
  /* 水平横線 x 範囲 (+23 シフト) */
  const h1X1 = 87, h1X2 = 414;
  const h2X1 = 85, h2X2 = 419;

  /* 角丸 elbow path を生成（半径 r=4）
     restrict-template-expressions 回避のため String() で明示変換 */
  const r = 4;
  const elbow = (ix: number, fromY: number, toY: number): string => {
    const xs = String(ix);
    const xl = String(ix + r);
    const xr = String(ix - r);
    const fy = String(fromY);
    const ty = String(toY);
    const fr = String(fromY + r);
    return ix < cx
      ? "M" + xl + "," + fy + " Q" + xs + "," + fy + " " + xs + "," + fr + " L" + xs + "," + ty
      : "M" + xr + "," + fy + " Q" + xs + "," + fy + " " + xs + "," + fr + " L" + xs + "," + ty;
  };

  return (
    <svg
      viewBox="0 0 500 560"
      fill="none"
      className="pointer-events-none absolute inset-x-0 top-0 w-full"
      aria-hidden
    >
      {/* 縦幹: ロゴ下端 → 第1横線 */}
      <line x1={cx} y1={trunkTopY} x2={cx} y2={h1Y} stroke={S} strokeWidth={SW} />

      {/* 第1水平横線 */}
      <line x1={h1X1} y1={h1Y} x2={h1X2} y2={h1Y} stroke={S} strokeWidth={SW} />

      {/* 上段3本: 第1横線 → 上段アイコン */}
      {topXs.map((ix) => (
        ix === cx
          ? <line key={ix} x1={ix} y1={h1Y} x2={ix} y2={topIconY} stroke={S} strokeWidth={SW} />
          : <path key={ix} d={elbow(ix, h1Y, topIconY)} stroke={S} strokeWidth={SW} />
      ))}

      {/* 縦枝: 第1横線(x=cx) → 第2横線 */}
      <line x1={cx} y1={h1Y} x2={cx} y2={h2Y} stroke={S} strokeWidth={SW} />

      {/* 第2水平横線 */}
      <line x1={h2X1} y1={h2Y} x2={h2X2} y2={h2Y} stroke={S} strokeWidth={SW} />

      {/* 下段4本: 第2横線 → 下段アイコン */}
      {botXs.map((ix) => (
        <path key={ix} d={elbow(ix, h2Y, botIconY)} stroke={S} strokeWidth={SW} />
      ))}
    </svg>
  );
}

/**
 * カード 1 のストーリーボード（rec-5 実測 2026-06-11、Fable 5 再解析で確定）:
 *   idle(2.9s) → card 出現+hold(1.4s) → strip: 白地+テキスト先消え(0.4s)
 *   → drop: サムネがバッグの口へ「下降」して背面に隠れる(0.6s)
 *   → swallow: バッグが飲み込み scale パルス+光輪(0.5s)
 *   → pulse: teal パルスが幹線を伝い下る(0.4s) → ring: 対象アイコンにリング点灯(0.8s)
 *   → rest(1.0s) → 繰り返し（1 周 8.0s）
 */
const CHANNEL_STAGES: readonly TimelineStage[] = [
  { key: "idle", ms: 2900 },
  { key: "card", ms: 1400 },
  { key: "strip", ms: 400 },
  { key: "drop", ms: 600 },
  { key: "swallow", ms: 500 },
  { key: "pulse", ms: 400 },
  { key: "ring", ms: 800 },
  { key: "rest", ms: 1000 },
];

const CARD_VISIBLE = new Set(["card", "strip", "drop"]);
const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1];

function ChannelsGraphMock(): ReactElement {
  const reduced = useReducedMotion();
  const { ref, stageKey } = useStageTimeline<HTMLDivElement>(CHANNEL_STAGES);
  const stage = reduced ? "idle" : stageKey;

  const stripped = stage === "strip" || stage === "drop";

  return (
    /*
     * 全体コンテナ: SVG viewBox=500×560 基準で絶対配置。
     * 元 454×530 から左右 +23 ずつ余白を追加した座標系。
     * 商品カード出現位置: 元中心 x=234+23=257 / y=184（カード幅≈184px）
     *   → left = (257 - 184/2) / 500 ≈ 33.0% / top = (184 - 157/2) / 560 ≈ 18.7%
     */
    <div aria-hidden ref={ref} className="relative flex h-full items-center justify-center">
      <div className="relative w-[min(454px,100%)]" style={{ aspectRatio: "500/560" }}>
        {/* 商品カード（中心 x=257/y=184）。card で出現 → strip で白地+文字が先に消える
            → drop でサムネだけがバッグの口へ下降（バッグ z-20 の背面に滑り込む） */}
        {CARD_VISIBLE.has(stage) ? (
          <motion.div
            className="pointer-events-none absolute z-10"
            style={{ top: "18.7%", left: "33.0%" }}
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <motion.div
              className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
              initial={false}
              animate={{
                backgroundColor: stripped ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)",
                boxShadow: stripped
                  ? "0 10px 28px rgba(0,0,0,0)"
                  : "0 10px 28px rgba(0,0,0,0.38)",
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* サムネ 56px: drop でバッグの口（Δx+35px/Δy+80px @454px 幅）へ下降・縮小 */}
              <motion.img
                src="/shopify-jp/knit-still-black.jpg"
                alt=""
                className="size-14 shrink-0 rounded-lg object-cover"
                initial={false}
                animate={
                  stage === "drop"
                    ? { x: 35, y: 80, scale: 0.4, opacity: [1, 1, 0] }
                    : { x: 0, y: 0, scale: 1, opacity: 1 }
                }
                transition={
                  stage === "drop"
                    ? { duration: 0.6, ease: "easeIn", opacity: { times: [0, 0.82, 1], duration: 0.6 } }
                    : { duration: 0.2 }
                }
              />
              <motion.div
                className="flex flex-col gap-1"
                initial={false}
                animate={{ opacity: stripped ? 0 : 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <span className="text-[12px] font-[550] leading-[1.35] text-gray-900">
                  フォレスト
                  <br />
                  ニットセーター
                </span>
                <span className="text-[12px] font-[600] text-gray-700">¥19,000</span>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}

        {/* バッグ背後の常設グロー（本家: 中央に淡い teal の光だまり） */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: "20%",
            top: "18%",
            width: "60%",
            aspectRatio: "1",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(54,244,164,0.10) 0%, rgba(54,244,164,0) 70%)",
          }}
        />

        {/* 中央バッグ: 中心 x=250/y=243、105×125。z-20 でサムネ（z-10）より手前 = 「口に落ちて隠れる」
            swallow で飲み込み scale パルス + 光輪 */}
        <motion.div
          className="absolute z-20"
          style={{ left: "39.5%", top: "32.2%", width: "21.0%" }}
          initial={false}
          animate={stage === "swallow" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={
            stage === "swallow"
              ? { duration: 0.5, times: [0, 0.4, 1], ease: "easeOut" }
              : { duration: 0.2 }
          }
        >
          {/* 光輪（飲み込み時のみ点灯） */}
          <motion.div
            className="pointer-events-none absolute -inset-10 rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(54,244,164,0.55) 0%, rgba(54,244,164,0) 70%)",
            }}
            initial={false}
            animate={{ opacity: stage === "swallow" ? [0, 1, 0] : 0 }}
            transition={
              stage === "swallow"
                ? { duration: 0.5, times: [0, 0.4, 1] }
                : { duration: 0.15 }
            }
          />
          <KonohaBagLogo />
        </motion.div>

        {/* 接続線 SVG（絶対・全面） */}
        <ConnectionLines />

        {/* teal パルス: 幹線を伝って Instagram 相当（中央 x=250）へ下る。
            path: ロゴ下端(250,294) → 第1横線(350) → アイコン(458) の一直線 */}
        <svg
          viewBox="0 0 500 560"
          fill="none"
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] w-full"
        >
          <motion.line
            x1={250}
            y1={294}
            x2={250}
            y2={452}
            stroke="#36f4a4"
            strokeWidth={2}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.18 1.18"
            initial={false}
            animate={
              stage === "pulse"
                ? { strokeDashoffset: [1.18, -0.18], opacity: 1 }
                : { strokeDashoffset: 1.18, opacity: 0 }
            }
            transition={
              stage === "pulse"
                ? { strokeDashoffset: { duration: 0.4, ease: "linear" }, opacity: { duration: 0.05 } }
                : { duration: 0.1 }
            }
          />
        </svg>

        {/* 対象アイコンのリング点灯（Instagram 相当: x=50%/y=81.8%） */}
        <motion.div
          className="pointer-events-none absolute z-[6] size-[60px] rounded-full border-2 border-[#36f4a4]"
          style={{ top: "81.8%", left: "50.0%", x: "-50%", y: "-50%" }}
          initial={false}
          animate={
            stage === "ring"
              ? { opacity: [0, 1, 1, 0], scale: [0.75, 1.04, 1, 1] }
              : { opacity: 0, scale: 0.75 }
          }
          transition={
            stage === "ring"
              ? { duration: 0.8, times: [0, 0.25, 0.75, 1], ease: "easeOut" }
              : { duration: 0.15 }
          }
        />

        {/* 上段 3 個（丸型）: y=458 / x=139,250,364（+23 シフト）
            top = 458/560 ≈ 81.8%。各 x: 139→27.8% / 250→50.0% / 364→72.8%
            アイコン幅 46px → 中心揃えに -translate-x-1/2 -translate-y-1/2 */}
        <div className="absolute" style={{ top: "81.8%", left: "27.8%", transform: "translate(-50%,-50%)" }}>
          <IconPinterest />
        </div>
        <div className="absolute" style={{ top: "81.8%", left: "50.0%", transform: "translate(-50%,-50%)" }}>
          <IconInstagram />
        </div>
        <div className="absolute" style={{ top: "81.8%", left: "72.8%", transform: "translate(-50%,-50%)" }}>
          <IconGoogle />
        </div>

        {/* 下段 4 個（角丸型）: y=511 / x=85,196,308,419（+23 シフト）
            top = 511/560 ≈ 91.3%。各 x: 85→17.0% / 196→39.2% / 308→61.6% / 419→83.8% */}
        <div className="absolute" style={{ top: "91.3%", left: "17.0%", transform: "translate(-50%,-50%)" }}>
          <IconEbay />
        </div>
        <div className="absolute" style={{ top: "91.3%", left: "39.2%", transform: "translate(-50%,-50%)" }}>
          <IconTiktok />
        </div>
        <div className="absolute" style={{ top: "91.3%", left: "61.6%", transform: "translate(-50%,-50%)" }}>
          <IconAmazon />
        </div>
        <div className="absolute" style={{ top: "91.3%", left: "83.8%", transform: "translate(-50%,-50%)" }}>
          <IconYoutube />
        </div>
      </div>
    </div>
  );
}

/* ---------- サブカード media 2: konoha POS 端末モック ---------- */

function PosMock(): ReactElement {
  return (
    <div aria-hidden className="relative flex h-full flex-col items-center justify-center gap-4">
      {/* teal 照明（AI 生成画像の代替 DOM モック） */}
      <SpGlowEllipse
        color="rgba(28,78,80,0.55)"
        className="top-1/2 left-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2"
      />
      <div className="relative w-[178px] rounded-[20px] border border-white/10 bg-gradient-to-b from-[#1d2f32] to-[#0b181a] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
        <div className="rounded-xl bg-[#04181a] p-3">
          <div className="flex justify-between text-[10px] text-white/45">
            <span>セラム ×1</span>
            <span>¥3,400</span>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-white/45">
            <span>マグ ×2</span>
            <span>¥4,400</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-2.5">
            <span className="text-[10px] text-white/60">合計</span>
            <span className="text-[16px] font-[550] text-white">¥7,800</span>
          </div>
        </div>
        <div className="mt-3 flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15">
          <Wifi className="size-5 rotate-90 text-sp-avocado" />
          <span className="text-[9px] text-white/45">タッチ決済</span>
        </div>
      </div>
      <span className="relative text-[10px] tracking-[0.2em] text-white/40">konoha POS</span>
    </div>
  );
}

/* ---------- サブカード media 3: 静止 checkout UI モック（録画解析 2026-06-11 反映） ---------- */

function CheckoutMock(): ReactElement {
  return (
    <div aria-hidden className="relative flex h-full w-full items-start justify-center overflow-hidden pt-8">
      {/* checkout カード */}
      <div className="w-[280px] rounded-2xl border border-white/10 bg-[#0d1f22] shadow-[0_20px_48px_rgba(0,0,0,0.5)]">
        {/* 注文サマリー ヘッダ */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-[550] text-white">注文サマリー</span>
            <span className="text-[11px] text-white/50">^</span>
          </div>
          <span className="text-[12px] font-[550] text-white">¥19,000</span>
        </div>

        {/* 商品行 */}
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3.5">
          <div className="relative shrink-0">
            <img
              src="/shopify-jp/knit-model.jpg"
              alt="フォレストニットセーター"
              className="size-10 rounded-md object-cover"
            />
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-white/20 text-[9px] text-white">
              1
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[11px] font-[500] text-white/90">フォレストニットセーター</span>
            <span className="text-[10px] text-white/45">Wサイズ</span>
          </div>
          <span className="shrink-0 text-[11px] font-[550] text-white">¥19,000</span>
        </div>

        {/* クーポンコード欄 */}
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3">
          <div className="flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-[11px] text-white/35">
            クーポンコードを入力
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-[11px] font-[500] text-white/70"
          >
            適用
          </button>
        </div>

        {/* 明細 */}
        <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4">
          <div className="flex justify-between text-[11px] text-white/55">
            <span>小計</span>
            <span>¥19,000</span>
          </div>
          <div className="flex justify-between text-[11px] text-white/55">
            <span>配送料</span>
            <span>無料</span>
          </div>
          <div className="flex justify-between text-[11px] text-white/55">
            <span>推定税額</span>
            <span>¥1,500</span>
          </div>
        </div>

        {/* 合計 */}
        <div className="flex items-baseline justify-between px-5 py-3.5">
          <span className="text-[13px] font-[550] text-white">合計</span>
          <span className="text-[16px] font-[650] text-white">¥20,500</span>
        </div>

        {/* 支払いボタン */}
        <div className="px-5 pb-5">
          <button
            type="button"
            className="w-full rounded-xl bg-[#5A31F4] py-3.5 text-[13px] font-[550] text-white shadow-[0_4px_16px_rgba(90,49,244,0.4)]"
          >
            今すぐ支払う
          </button>
        </div>
      </div>

      {/* 下フェード */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sp-green to-transparent" />
    </div>
  );
}

/* ---------- サブカード data（glow は実測値、1cqw = card 幅/100） ---------- */

interface SubCard {
  key: string;
  title: ReactNode;
  body: ReactNode;
  glow: CSSProperties;
  Media: () => ReactElement;
}

const SUB_CARDS: SubCard[] = [
  {
    key: "channels",
    title: "あらゆるチャネルで販売",
    body: (
      <>
        <SpTextLink>複数チャネルとつながる</SpTextLink>
        ことで、お客様が探す画面、購入する画面、なにげなく眺める画面のすべてに、商品をまとめて届けられます。
      </>
    ),
    glow: {
      top: "18cqw",
      left: "4cqw",
      width: "84cqw",
      height: "70cqw",
      background: "radial-gradient(#1C4E50, #133032 34%, #091A1C 70%, #061A1C)",
      transform: "scale(1.6) rotate(53deg)",
    },
    Media: ChannelsGraphMock,
  },
  {
    key: "pos",
    title: "対面販売を強化する",
    body: (
      <>
        店頭での販売もそのまま。レジ端末「<SpTextLink>konoha POS</SpTextLink>
        」を使えば、ネットの注文と実店舗のレジをひとつの管理画面にまとめて運用できます。
      </>
    ),
    glow: {
      top: "17cqw",
      left: "20cqw",
      width: "83cqw",
      height: "75cqw",
      background: "radial-gradient(#3E4646, #0F3335 40%, #061A1C 70%, #061A1C)",
      transform: "scale(1.8)",
    },
    Media: PosMock,
  },
  {
    key: "checkout",
    title: "konoha アプリで 2億5,000万人以上の買い物客にリーチ",
    body: (
      <>
        商品は <SpTextLink>konoha アプリ</SpTextLink>
        へ自動で掲載。本人確認済みの巨大な買い物客層に向けて、追加の設定なしにそのまま販売の間口を広げられます。
      </>
    ),
    glow: {
      top: "32cqw",
      left: "6cqw",
      width: "84cqw",
      height: "84cqw",
      background: "radial-gradient(#2A4344, rgb(6 26 28) 70%, #061A1C)",
      transform: "scale(1.6)",
    },
    Media: CheckoutMock,
  },
];

/* ---------- section 本体 ---------- */

export function SpSellMore(): ReactElement {
  // TODO(measure): 入場 reveal の有無は未実測（仮: 0.7s fade + 8px rise を heading のみに適用）
  const { ref: headingRef, inView: headingIn } = useRevealInView<HTMLDivElement>(0.2);
  // TODO(measure): メディアの lazy mount 閾値は未実測（仮: threshold 0.15 / 0.1）
  const { ref: bigCardRef, inView: bigCardIn } = useRevealInView<HTMLDivElement>(0.15);
  const { ref: gridRef, inView: gridIn } = useRevealInView<HTMLDivElement>(0.1);

  return (
    /* 高さ計画 @1440: pt76 + 見出し128 + 64 + 大カード607 + 16 + サブ697 + pb38 ≒ 1626px
       実測(2026-06-10): 本家は大カード top=267 / サブ下端→section 下端=38px → pt76+pb38 で一致 */
    <SpSection id="04-sell-more" bg="dark" className="pt-[76px] pb-[38px]">
      <SpContainer>
        <div
          ref={headingRef}
          /* 実測: 本家 H1 はベタ組（palt なし、line1=687px）→ .sp-root の palt をこの見出しだけ解除 */
          className={`pb-16 transition-all duration-700 ease-out [font-feature-settings:normal] ${
            headingIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
        >
          <SpSectionHeading
            title={
              <>
                より多くの場所で、より多く
                <br className="hidden lg:block" />
                の販売を
              </>
            }
            aside={
              /* 実測: 本家 aside は 3 行 60px（行送り ≒22.5px → lh1.4）。共有 1.8 を上書き */
              <p className="leading-[1.4]">
                販売に必要な機能を最初から備えた、
                <SpTextLink>印象に残るストアを作れます</SpTextLink>
                。AI による素早いデザインも、用意されたテーマも、ゼロからの作り込みも選べます。
              </p>
            }
          />
        </div>

        {/* 大カード card-ose（1260×607、video 1148×598 相当の DOM モック）
            TODO(measure): shadow-card の実値は未実測（SpDarkCard の仮 shadow を使用） */}
        <div ref={bigCardRef}>
          <SpDarkCard radius="xl" className="h-[607px] bg-[linear-gradient(0deg,#061518_20%,#0A2C30)]">
            <div className="flex h-full items-center justify-center px-[56px]">
              {bigCardIn ? (
                /* 本家 video の読込後 300ms フェードインを mount フェードで再現 */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full max-w-[1148px]"
                >
                  <EditorShowcaseMock />
                </motion.div>
              ) : (
                <div className="h-[598px] w-full max-w-[1148px]" />
              )}
            </div>
          </SpDarkCard>
        </div>

        {/* サブカード ×3（各 409×697、@container で glow を cqw 指定） */}
        <div ref={gridRef} className="mt-4 grid gap-4 md:grid-cols-3">
          {SUB_CARDS.map((card) => (
            <SpDarkCard key={card.key} radius="xl" className="@container flex h-[697px] flex-col justify-between">
              <div aria-hidden className="pointer-events-none absolute z-0 rounded-[340px]" style={card.glow} />
              {gridIn ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative z-[1] min-h-0 flex-1"
                >
                  <card.Media />
                </motion.div>
              ) : (
                <div className="min-h-0 flex-1" />
              )}
              <div className="relative z-10 shrink-0 px-8 pt-4 pb-8">
                <SpCaptionBlock title={card.title}>{card.body}</SpCaptionBlock>
              </div>
            </SpDarkCard>
          ))}
        </div>
      </SpContainer>
    </SpSection>
  );
}
