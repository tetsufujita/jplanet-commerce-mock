import { useEffect, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from "motion/react";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";
import { useStageTimeline, type TimelineStage } from "@/shopify-jp/ui/hooks";

/**
 * 03-chat — ブランドがチャットに登場（agentic section）
 * 再現ソース: design/reproductions/shopify-jp/recordings/spec-s03-chat-demo.md
 *            + recordings/f3/*.png（4fps frame burst / 差分 spec-s03-delta.md）
 * 本家デモ動画（webm）は CSS/実写写真 + motion/react の DOM モックで置換（CDN 参照禁止）。
 * 13.25s / 7 stage のループ: 入力誕生 → 回答 → device reveal → 詳細 → 購入確認
 * → constellation → Thank you → push-through 暗転。
 */

const EASE_OUT_CUBIC: [number, number, number, number] = [0.33, 1, 0.68, 1];

const HEADING = "ブランドがチャットに登場";
const PARAGRAPH_BEFORE_LINK =
  "AI アシスタント上で商品が見つかり、買い物客は会話の流れのままチェックアウトまで完了。注文状況の追跡にも対応します。この体験を支えるのが、";
const PARAGRAPH_LINK = "Agent Storefront";
const PARAGRAPH_AFTER_LINK = " です。";

/* ---------------------------------------------------------------- */
/* AI チャネルアイコン（架空ブランドの自作グリフ。本家ロゴは複製しない） */
/* ---------------------------------------------------------------- */

const AI_CHANNELS: { name: string; glyph: ReactNode }[] = [
  {
    // 架空 AI「Quill」— 結び目風の単色ストローク
    name: "Quill",
    glyph: (
      <svg viewBox="0 0 28 28" className="size-5 md:size-7" aria-hidden="true">
        <path
          d="M14 4.5a9.5 9.5 0 1 1-9.5 9.5"
          fill="none"
          stroke="#0D1B1A"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M14 9.5a4.5 4.5 0 1 0 4.5 4.5"
          fill="none"
          stroke="#0D1B1A"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    // 架空検索「Loupe」— 2 色のシンプルな円弧グリフ
    name: "Loupe",
    glyph: (
      <svg viewBox="0 0 28 28" className="size-5 md:size-7" aria-hidden="true">
        <circle cx="12.5" cy="12.5" r="7" fill="none" stroke="#2D6BFF" strokeWidth="3" />
        <path d="M17.8 17.8 24 24" stroke="#F4B400" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    // 架空 assistant「Halo」— グラデーション付きリボン形
    name: "Halo",
    glyph: (
      <svg viewBox="0 0 28 28" className="size-5 md:size-7" aria-hidden="true">
        <defs>
          <linearGradient id="sp03-halo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#19C8FF" />
          </linearGradient>
        </defs>
        <path d="M4 16.5C6.5 8.5 14 4.5 23.5 6.2c-1.8 8.3-9 12.6-19.5 10.3Z" fill="url(#sp03-halo)" />
        <path
          d="M24 11.5c-2.5 8-10 12-19.5 10.3 1.8-8.3 9-12.6 19.5-10.3Z"
          fill="url(#sp03-halo)"
          opacity="0.55"
        />
      </svg>
    ),
  },
];

/* ---------------------------------------------------------------- */
/* 13.25s / 7 stage timeline（spec-s03-chat-demo.md §1–2）            */
/* ---------------------------------------------------------------- */

const STAGES = [
  { key: "sweaterIn", ms: 1000 }, // S1 0.00–1.00 暗転明け → sweater fade-in
  { key: "caret", ms: 250 }, //       1.00–1.25 キャレット pop（縦 pill）
  { key: "barGrow", ms: 250 }, //     1.25–1.50 横展開して入力バーへ（spring）
  { key: "barHold", ms: 500 }, //     1.50–2.00 バー hold + send pop-in
  { key: "typing", ms: 1000 }, //     2.00–3.00 typewriter（~25ms/字）
  { key: "bubble", ms: 500 }, //   S2 3.00–3.50 pill→bubble morph + 商品 card crossfade
  { key: "caption", ms: 1000 }, //    3.50–4.50 商品名 typewriter
  { key: "holdS2", ms: 750 }, //      4.50–5.25 hold
  { key: "zoomOut", ms: 500 }, //  S3 5.25–5.75 zoom-out + phone frame fade-in
  { key: "carousel", ms: 750 }, //    5.75–6.50 chat UI 解像 + carousel stagger
  { key: "detail", ms: 1000 }, //  S4 6.50–7.50 詳細 bottom-sheet + hold
  { key: "confirm", ms: 500 }, //  S5 7.50–8.00 購入確認 sheet（checkout 入力は省略）
  { key: "dollyOut", ms: 1250 }, // S6 8.00–9.25 dolly-out + 周辺 phone fade-in
  { key: "constellation", ms: 1500 }, // 9.25–10.75 settle + idle drift
  { key: "thankYou", ms: 500 }, // S7 10.75–11.25 Thank you mosaic へ同位置 crossfade
  { key: "pushIn", ms: 1250 }, //     11.25–12.50 hold + 超低速 push-in
  { key: "pushThrough", ms: 500 }, // 12.50–13.00 push-through + fade-out
  { key: "blackout", ms: 250 }, //    13.00–13.25 暗転の呼吸 → ループ
] as const satisfies readonly TimelineStage[];

type StageKey = (typeof STAGES)[number]["key"];

const IDX = Object.fromEntries(STAGES.map((s, i) => [s.key, i] as const)) as Record<
  StageKey,
  number
>;

const INSTANT: Transition = { duration: 0 };
const SPRING: Transition = { type: "spring", stiffness: 260, damping: 24 };

const MSG = "I need a warm sweater in green. Under $200.";
const CAPTION_TEXT = "Forest Knit Sweater";
/** D4: フレーム実測に基づき更新 */
const REPLY_TEXT = "Absolutely. Here are some green sweaters under $200 that you might love.";

/** D5/D6/D13: ブランド名・商品名をフレーム実測値に更新 */
const CAROUSEL_CARDS = [
  { name: "Forest Knit Sweater", brand: "konoha", price: "$125.00", img: "/shopify-jp/knit-model.jpg" },
  { name: "Cashmere Crewneck", brand: "amairo", price: "$148.00", img: "/shopify-jp/knit-camel.jpg" },
  { name: "Ribbed Cable Knit", brand: "miru", price: "$172.00", img: "/shopify-jp/knit-flat.jpg" },
] as const;

/** D12: bubble の top を -22% に上げて card との間隔を確保 */
/** D15: pill の初期 x 位置を sweater と重なる位置へ調整 */
const PILL_POSE = {
  pre: { opacity: 0, left: "55%", top: "30%", width: "4.5%", scaleY: 0.3, scale: 1, borderRadius: 12 },
  caret: { opacity: 1, left: "55%", top: "30%", width: "4.5%", scaleY: 1, scale: 1, borderRadius: 12 },
  bar: { opacity: 1, left: "4%", top: "36%", width: "92%", scaleY: 1, scale: 1, borderRadius: 14 },
  bubble: { opacity: 1, left: "21%", top: "-22%", width: "76%", scaleY: 1, scale: 0.85, borderRadius: 14 },
  post: { opacity: 0, left: "21%", top: "-22%", width: "76%", scaleY: 1, scale: 0.85, borderRadius: 14 },
} as const;

const PILL_TRANS: Record<keyof typeof PILL_POSE, Transition> = {
  pre: INSTANT,
  caret: { duration: 0.22, ease: EASE_OUT_CUBIC },
  bar: SPRING,
  bubble: { duration: 0.4, ease: EASE_OUT_CUBIC },
  post: { duration: 0.35, ease: "linear" },
};

/** D16: constellation を 13 台に増量（遠景 far 層を 2 台追加） */
interface ConstellationItem {
  left: string;
  top: string;
  width: string;
  depth: "near" | "mid" | "far";
  name?: string;
  portrait?: string;
  accent?: boolean;
  delay: number;
  dx: number;
  dy: number;
  dur: number;
}

const CONSTELLATION: readonly ConstellationItem[] = [
  { left: "24%", top: "12%", width: "18%", depth: "near", name: "Nyoka", portrait: "/shopify-jp/portrait-nyoka.jpg", delay: 0.15, dx: 4, dy: -6, dur: 6.5 },
  { left: "58%", top: "48%", width: "19%", depth: "near", name: "Alberto", portrait: "/shopify-jp/portrait-alberto.jpg", delay: 0.05, dx: -4, dy: 5, dur: 7.2 },
  { left: "18%", top: "55%", width: "16%", depth: "near", name: "Fabian", portrait: "/shopify-jp/portrait-fabian.jpg", accent: true, delay: 0.3, dx: 3, dy: 6, dur: 5.6 },
  { left: "10%", top: "28%", width: "11%", depth: "mid", delay: 0.4, dx: -3, dy: -4, dur: 6.1 },
  { left: "70%", top: "16%", width: "12%", depth: "mid", delay: 0.25, dx: 4, dy: 4, dur: 7.8 },
  { left: "78%", top: "60%", width: "10%", depth: "mid", delay: 0.5, dx: -3, dy: 5, dur: 6.9 },
  { left: "42%", top: "76%", width: "11%", depth: "mid", delay: 0.35, dx: 2, dy: -5, dur: 5.9 },
  { left: "5%", top: "70%", width: "8%", depth: "far", delay: 0.6, dx: -2, dy: 3, dur: 7.4 },
  { left: "49%", top: "3%", width: "8%", depth: "far", delay: 0.55, dx: 2, dy: -3, dur: 6.6 },
  { left: "88%", top: "36%", width: "7%", depth: "far", delay: 0.7, dx: 3, dy: 3, dur: 7.0 },
  { left: "3%", top: "8%", width: "7%", depth: "far", delay: 0.65, dx: -2, dy: -3, dur: 6.3 },
  // D16 追加: 遠景 far 層 2 台
  { left: "33%", top: "88%", width: "7%", depth: "far", delay: 0.72, dx: 2, dy: -2, dur: 6.8 },
  { left: "64%", top: "82%", width: "6%", depth: "far", delay: 0.58, dx: -2, dy: 3, dur: 7.1 },
];

const DEPTH_OPACITY: Record<ConstellationItem["depth"], number> = {
  near: 0.95,
  mid: 1,
  far: 0.5,
};

// 深度の見せ方: 近景=大+強 blur / 中景=ピント / 遠景=小+減光（blur は静的 class — アニメしない）
const DEPTH_CLASS: Record<ConstellationItem["depth"], string> = {
  near: "z-30 blur-[1.5px]",
  mid: "z-20",
  far: "z-10 blur-[1px]",
};

type TwMode = "idle" | "typing" | "done";

/**
 * substring typewriter。caret は描画しない（本家準拠）。done で全文即表示 / idle で空。
 * MotionValue 駆動（React state 不使用 → re-render なしで文字が増える）。
 */
function TypeText({
  text,
  mode,
  durationMs,
  className,
}: {
  text: string;
  mode: TwMode;
  durationMs: number;
  className?: string;
}) {
  const progress = useMotionValue(0);
  const display = useTransform(progress, (v: number) => text.slice(0, Math.round(v)));

  useEffect(() => {
    if (mode !== "typing") {
      progress.set(mode === "done" ? text.length : 0);
      return;
    }
    progress.set(0);
    const controls = animate(progress, text.length, {
      duration: durationMs / 1000,
      ease: "linear",
    });
    return () => {
      controls.stop();
    };
  }, [text, mode, durationMs, progress]);

  return <motion.span className={className}>{display}</motion.span>;
}

/* ---------------------------------------------------------------- */
/* 小物 component                                                     */
/* ---------------------------------------------------------------- */

/**
 * D1/D2: 実写写真を表示する汎用コンポーネント。
 * 旧 ProductPhoto (gradient+SVG) と KnitSweater SVG を置き換える。
 */
function ProductImage({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

/**
 * D9: 地図 placeholder を改善 — リアル地図風 SVG + Jordan 顔写真マーカー。
 * Apple Maps 系ライト配色にストリートライン + 顔写真サークルを追加。
 */
function MapBlock() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg viewBox="0 0 100 56" className="h-full w-full" aria-hidden="true" preserveAspectRatio="none">
        {/* ベースカラー（Apple Maps 系ライトベージュ） */}
        <rect width="100" height="56" fill="#F2EEE3" />
        {/* ブロック（街区） */}
        <rect x="0" y="0" width="20" height="15" fill="#E8E2D4" />
        <rect x="22" y="0" width="18" height="12" fill="#EAE4D6" />
        <rect x="62" y="18" width="16" height="18" fill="#E8E2D4" />
        <rect x="0" y="32" width="22" height="24" fill="#EAE4D6" />
        <rect x="45" y="38" width="20" height="18" fill="#E8E2D4" />
        {/* 幹線道路（太め白） */}
        <path d="M0 26 H100" stroke="#FFFFFF" strokeWidth="5" fill="none" />
        <path d="M22 0 V56" stroke="#FFFFFF" strokeWidth="4" fill="none" />
        {/* 細い道路 */}
        <path d="M0 38 H100 M60 0 L78 56 M0 12 H100 M44 0 V56" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.9" />
        {/* 公園（薄緑） */}
        <rect x="24" y="14" width="18" height="12" fill="#D4E9C8" />
      </svg>
      {/* Jordan 顔写真マーカー（丸形） */}
      <div className="absolute left-[50%] top-[38%] -translate-x-1/2 -translate-y-1/2">
        <div className="size-[14%] min-h-[8px] min-w-[8px] overflow-hidden rounded-full border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
          <div className="h-full w-full bg-[linear-gradient(135deg,#C9A880_0%,#8C6A4A_100%)]" />
        </div>
      </div>
    </div>
  );
}

/**
 * D10: CheckoutFace をライトモード chat UI 風モックに刷新。
 * 2 バリアント: カルーセル型（variant="carousel"）と注文確認型（variant="order"）。
 */
function CheckoutFace({ accent = false }: { accent?: boolean }) {
  // accent = true → 注文確認型、false → カルーセル型
  if (accent) {
    // 注文確認型（Order confirmed）
    return (
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        {/* status bar */}
        <div className="mx-[8%] mt-[4%] flex items-center justify-between">
          <span className="h-[2px] w-[18%] rounded-full bg-[#C8CCD0]" />
          <span className="h-[2px] w-[10%] rounded-full bg-[#C8CCD0]" />
        </div>
        {/* 地図エリア */}
        <div className="mx-[8%] mt-[6%] h-[28%] overflow-hidden rounded-md bg-[#F2EEE3]">
          <svg viewBox="0 0 40 18" className="h-full w-full" aria-hidden="true" preserveAspectRatio="none">
            <rect width="40" height="18" fill="#F2EEE3" />
            <path d="M0 9 H40 M8 0 V18" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            <rect x="10" y="2" width="8" height="6" fill="#E8E2D4" />
            <circle cx="20" cy="9" r="2" fill="#6E56F8" />
          </svg>
        </div>
        {/* Order confirmed */}
        <div className="mx-[8%] mt-[5%] text-center">
          <p className="text-[5px] font-semibold text-[#15181A]">Order confirmed</p>
          <p className="mt-[3%] text-[3.5px] text-[#6F757A]">Order placed</p>
        </div>
        {/* Track ボタン */}
        <div className="mx-[8%] mt-[5%] rounded-full bg-[#6E56F8] py-[4%] text-center text-[3.5px] font-medium text-white">
          Track order
        </div>
      </div>
    );
  }

  // カルーセル型
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      {/* status bar */}
      <div className="mx-[8%] mt-[3%] flex items-center justify-between">
        <span className="text-[3.5px] font-medium text-[#15181A]">11:30</span>
        <span className="h-[2px] w-[10%] rounded-full bg-[#C8CCD0]" />
      </div>
      {/* chat title */}
      <div className="mt-[2%] text-center text-[4px] font-medium text-[#15181A]">Quill</div>
      {/* assistant reply */}
      <p className="mx-[8%] mt-[3%] text-[3px] leading-[1.4] text-[#333]">
        Here are some sweaters you might love.
      </p>
      {/* mini carousel cards */}
      <div className="mx-[5%] mt-[4%] flex gap-[4%]">
        {["#3B5E40", "#8B7355"].map((bg, i) => (
          <div key={i} className="w-[42%] overflow-hidden rounded-md bg-white">
            <div className="h-[14%] min-h-[8px]" style={{ background: bg }} />
            <div className="px-[6%] py-[4%]">
              <div className="h-[2px] w-3/4 rounded-full bg-[#C8CCD0]" />
              <div className="mt-[4%] h-[2px] w-1/2 rounded-full bg-[#E5E7EB]" />
            </div>
          </div>
        ))}
      </div>
      {/* input bar */}
      <div className="absolute inset-x-[5%] bottom-[3%] h-[8%] rounded-full border border-[#C8CCD0] bg-white px-[6%] flex items-center">
        <span className="text-[3px] text-[#9CA3AF]">+ Ask anything</span>
      </div>
    </div>
  );
}

/**
 * D11: ThankYouFace を実写ポートレート写真 + 白チェックマーク丸アイコンに刷新。
 * portrait パスが渡された場合は実写写真、ない場合はチェックマークのみ。
 */
function ThankYouFace({ name, portrait }: { name?: string; portrait?: string }) {
  if (!name) {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-[#15241D]">
        <span className="flex aspect-square w-[34%] items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 10 8" className="h-1/2 w-1/2" aria-hidden="true">
            <path d="M1 4.2 3.6 6.8 9 1.2" fill="none" stroke="#101415" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-[linear-gradient(168deg,#D4A87A_0%,#C08B5A_35%,#8B5E3C_65%,#5C3D28_100%)]">
      {portrait && (
        <img
          src={portrait}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* D11: 白チェックマーク丸アイコン（左上） */}
      <span className="absolute left-[8%] top-[8%] flex aspect-square w-[20%] items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
        <svg viewBox="0 0 10 8" className="h-1/2 w-1/2" aria-hidden="true">
          <path d="M1 4.2 3.6 6.8 9 1.2" fill="none" stroke="#101415" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      {/* 名前テキスト（左下、白、drop-shadow） */}
      <p className="absolute bottom-[7%] left-[9%] text-[8px] font-medium leading-[1.25] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
        Thank you,
        <br />
        {name}!
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* ChatDemoMock 本体                                                  */
/* ---------------------------------------------------------------- */

/**
 * 13.25s / 7 stage の購買 journey ループ。
 * useStageTimeline が in-view 外で停止、reduced-motion 時は S2 の静止合成 frame を表示。
 */
function ChatDemoMock() {
  const { ref, stageKey, running } = useStageTimeline<HTMLDivElement>(STAGES);
  const reduced = useReducedMotion() ?? false;
  // reduced-motion 時は S2 静止合成 frame（bubble + card + caption）
  const k: string = reduced ? "caption" : stageKey;
  const found = STAGES.findIndex((s) => s.key === k);
  const t = found < 0 ? 0 : found;

  /** stage window [from, until) に入っているか */
  const vis = (from: number, until: number = STAGES.length): boolean => t >= from && t < until;
  /** 表示中は enter、非表示への遷移 stage ちょうどなら exit、それ以外（ループ reset 等）は即時 */
  const tr = (on: boolean, enter: Transition, exitAt?: number, exit?: Transition): Transition => {
    if (on) return enter;
    if (exitAt !== undefined && t === exitAt) return exit ?? INSTANT;
    return INSTANT;
  };

  const msgMode: TwMode = reduced || t > IDX.typing ? "done" : t === IDX.typing ? "typing" : "idle";
  const captionMode: TwMode =
    reduced || t > IDX.caption ? "done" : t === IDX.caption ? "typing" : "idle";

  const pillPhase: keyof typeof PILL_POSE =
    t < IDX.caret ? "pre" : t < IDX.barGrow ? "caret" : t < IDX.bubble ? "bar" : t < IDX.carousel ? "bubble" : "post";
  const sendPhase: "hidden" | "ink" | "gray" =
    t < IDX.barHold || t >= IDX.carousel ? "hidden" : t < IDX.bubble ? "ink" : "gray";

  const chromeOn = vis(IDX.zoomOut);
  const uiOn = vis(IDX.carousel);
  const constOn = vis(IDX.dollyOut);
  const tyOn = vis(IDX.thankYou);
  const uiTrans = (delay: number): Transition =>
    uiOn ? { duration: 0.35, delay, ease: EASE_OUT_CUBIC } : INSTANT;

  return (
    // 本家はロード完了で opacity 0→100 / 300ms（ease-out-cubic）→ mount 時フェードで再現
    <motion.div
      ref={ref}
      role="img"
      aria-label="AI チャットへの入力から商品提示、購入確認、複数デバイスへの広がりまでを描くループデモ"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
      className="relative h-full w-full overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0">
        {/* SceneScaler — S7 push-in / push-through の全体 scale + opacity */}
        <motion.div
          initial={false}
          animate={
            k === "pushIn"
              ? { scale: 1.06, opacity: 1 }
              : k === "pushThrough" || k === "blackout"
                ? { scale: 1.8, opacity: 0 }
                : { scale: 1, opacity: 1 }
          }
          transition={
            k === "pushIn"
              ? { duration: 1.25, ease: "easeIn" }
              : k === "pushThrough"
                ? { duration: 0.5, ease: "easeIn" }
                : INSTANT
          }
          className="absolute inset-0 will-change-transform"
        >
          {/* 背景の暗い vignette */}
          <div className="absolute left-1/2 top-1/2 h-[72%] w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-[48px] bg-[radial-gradient(60%_60%_at_50%_45%,rgba(0,8,9,0.35)_0%,rgba(0,8,9,0)_100%)]" />

          {/* PhoneStage — S6 dolly-out で縮小、S7 crossfade で退場 */}
          <motion.div
            initial={false}
            animate={{ scale: t >= IDX.dollyOut ? 0.52 : 1, opacity: t >= IDX.thankYou ? 0 : 1 }}
            transition={{
              scale: k === "dollyOut" ? { duration: 1.25, ease: EASE_OUT_CUBIC } : INSTANT,
              opacity: k === "thankYou" ? { duration: 0.5, ease: "linear" } : INSTANT,
            }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="relative aspect-[9/19] h-[82%]">
              {/* PhoneFrame + chat UI — S3 で fade-in、S3 末で UI 解像 */}
              <motion.div
                initial={false}
                animate={{ opacity: chromeOn ? 1 : 0 }}
                transition={chromeOn ? { duration: 0.5, delay: 0.2, ease: EASE_OUT_CUBIC } : INSTANT}
                className="absolute inset-0"
              >
                {/* D3: phone 外枠は維持しつつ内側を light モードに */}
                <div className="absolute inset-0 rounded-[26px] border-[3px] border-[#43494D] bg-[#EBEBEB] shadow-[0_24px_60px_rgba(0,0,0,0.5)]" />
                <div className="absolute inset-[2%] overflow-hidden rounded-[20px] bg-[#EBEBEB]">
                  {/* notch */}
                  <div className="absolute left-1/2 top-[1.6%] z-20 h-[2.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />

                  {/* status bar — D3: テキスト色を dark に */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: uiOn ? 1 : 0 }}
                    transition={uiTrans(0)}
                    className="absolute inset-x-[7%] top-[1.8%] flex items-center justify-between text-[5px] font-medium text-[#15181A]"
                  >
                    <span>11:30</span>
                    <span className="flex items-center gap-[2px]">
                      <span className="h-[4px] w-[7px] rounded-[1px] bg-[#15181A]/70" />
                      <span className="h-[4px] w-[10px] rounded-[1px] border border-[#15181A]/60" />
                    </span>
                  </motion.div>

                  {/* D7: app header — 左にハンバーガーアイコン、中央に架空 AI 名「Quill」、右に 2 アイコン */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: uiOn ? 1 : 0 }}
                    transition={uiTrans(0.05)}
                    className="absolute inset-x-0 top-[6.2%] flex items-center justify-between px-[7%]"
                  >
                    {/* 左: ハンバーガー（三本線） */}
                    <svg viewBox="0 0 12 10" className="h-[6px] w-[7px]" aria-hidden="true">
                      <path d="M1 2h10M1 5h10M1 8h10" stroke="#15181A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {/* 中央: AI 名 */}
                    <span className="text-[6px] font-medium text-[#15181A]">Quill</span>
                    {/* 右: 共有+人物アイコン 2 つ */}
                    <span className="flex gap-[3px]">
                      {/* 共有アイコン（上向き矢印+ボックス） */}
                      <svg viewBox="0 0 10 10" className="h-[6px] w-[6px]" aria-hidden="true">
                        <path d="M5 1v5M3 3l2-2 2 2" stroke="#15181A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <rect x="1.5" y="5" width="7" height="4" rx="1" fill="none" stroke="#15181A" strokeWidth="1.2" />
                      </svg>
                      {/* 人物アイコン */}
                      <svg viewBox="0 0 10 10" className="h-[6px] w-[6px]" aria-hidden="true">
                        <circle cx="5" cy="3.5" r="2" fill="none" stroke="#15181A" strokeWidth="1.2" />
                        <path d="M1.5 9c0-1.93 1.57-3.5 3.5-3.5S8.5 7.07 8.5 9" stroke="#15181A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                      </svg>
                    </span>
                  </motion.div>

                  {/* 送信済み user bubble（phone 内解像版）— D3: 白背景・黒テキスト（iOS Messages 風） */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: uiOn ? 1 : 0 }}
                    transition={uiTrans(0.1)}
                    className="absolute right-[5%] top-[11.5%] max-w-[68%] rounded-lg rounded-br-[2px] bg-white px-1.5 py-1 text-[5.5px] leading-[1.35] text-[#15181A] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                  >
                    {MSG}
                  </motion.div>

                  {/* D3/D4: assistant 返信文 — ライトバックグラウンドに黒テキスト、更新されたテキスト */}
                  <motion.p
                    initial={false}
                    animate={{ opacity: uiOn ? 1 : 0 }}
                    transition={uiTrans(0.18)}
                    className="absolute left-[5%] right-[8%] top-[19.5%] text-[5.5px] leading-[1.4] text-[#15181A]"
                  >
                    {REPLY_TEXT}
                  </motion.p>

                  {/* D3/D5/D6: 横 carousel ×3（stagger fade-in、ライトモード、実写写真） */}
                  <div className="absolute left-[5%] top-[28%] flex h-[42%] w-full gap-[3%]">
                    {CAROUSEL_CARDS.map((card, i) => (
                      <motion.div
                        key={card.name}
                        initial={false}
                        animate={{ opacity: uiOn ? 1 : 0 }}
                        transition={uiTrans(i * 0.15)}
                        className="flex h-full w-[86%] shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      >
                        <div className="min-h-0 flex-1 overflow-hidden">
                          <ProductImage src={card.img} alt={card.name} />
                        </div>
                        <div className="px-1.5 py-1">
                          <p className="text-[5.5px] font-semibold text-[#15181A]">{card.name}</p>
                          <p className="flex items-center justify-between text-[4.5px] text-[#6F757A]">
                            <span>{card.brand}</span>
                            <span className="text-[5px] font-medium text-[#15181A]">{card.price}</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* D3/D14: 下端入力欄ダミー — ライトモード + "+ Ask anything" */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: uiOn ? 1 : 0 }}
                    transition={uiTrans(0.25)}
                    className="absolute inset-x-[5%] bottom-[2.2%] flex h-[5.5%] items-center justify-between rounded-full border border-[#C8CCD0] bg-white px-2 text-[5px] text-[#9CA3AF]"
                  >
                    <span>+ Ask anything</span>
                    <span className="flex size-[7px] items-center justify-center rounded-full bg-[#15181A]">
                      <svg viewBox="0 0 6 8" className="h-[5px] w-[4px]" aria-hidden="true">
                        <path d="M3 7V1.5M1 3.5 3 1.5 5 3.5" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </motion.div>

                  {/* S4 詳細 bottom-sheet — D8: konoha + Visit ボタン + In Stock / Free delivery 別行 */}
                  <motion.div
                    initial={false}
                    animate={{ y: vis(IDX.detail) ? "0%" : "106%" }}
                    transition={vis(IDX.detail) ? { duration: 0.5, ease: EASE_OUT_CUBIC } : INSTANT}
                    className="absolute inset-x-0 bottom-0 z-30 h-[66%] rounded-t-2xl bg-white px-[6%] pt-[5%]"
                  >
                    <div className="h-[44%] overflow-hidden rounded-lg">
                      <ProductImage src="/shopify-jp/knit-model.jpg" alt={CAPTION_TEXT} />
                    </div>
                    <p className="mt-1.5 text-[6.5px] font-semibold text-[#15181A]">{CAPTION_TEXT}</p>
                    {/* D8: ブランド行 — 緑丸+konoha / 価格+Visit ボタン */}
                    <p className="mt-0.5 flex items-center justify-between text-[4.5px]">
                      <span className="flex items-center gap-[2px] text-[#6F757A]">
                        <span className="inline-block size-[5px] rounded-full bg-[#3B7A4A]" />
                        konoha
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[5.5px] font-semibold text-[#15181A]">$125.00</span>
                        <span className="rounded border border-[#C8CCD0] px-1 py-[1px] text-[3.5px] text-[#6F757A]">Visit</span>
                      </span>
                    </p>
                    {/* D8: In Stock / Free delivery を別行（ドット区切り） */}
                    <p className="mt-[2px] text-[4px] text-[#6F757A]">In Stock · Free delivery</p>
                    <div className="my-1.5 border-t border-[#E7E9EB]" />
                    <p className="text-[5px] font-semibold text-[#15181A]">What to know</p>
                    <p className="mt-0.5 text-[4.5px] leading-[1.5] text-[#6F757A]">
                      Crafted from premium, soft-to-touch fabric, this sweater ensures maximum comfort
                      and durability.
                    </p>
                  </motion.div>

                  {/* S5 購入確認 sheet（checkout 入力工程はジャンプ省略） */}
                  <motion.div
                    initial={false}
                    animate={{ y: vis(IDX.confirm) ? "0%" : "106%" }}
                    transition={vis(IDX.confirm) ? { duration: 0.25, ease: EASE_OUT_CUBIC } : INSTANT}
                    className="absolute inset-x-0 bottom-0 z-40 h-[76%] overflow-hidden rounded-t-2xl bg-white"
                  >
                    <div className="h-[30%]">
                      <MapBlock />
                    </div>
                    <div className="px-[7%] pt-[5%] text-center">
                      <p className="text-[7.5px] font-semibold text-[#15181A]">Thank you, Jordan!</p>
                      <p className="mt-0.5 text-[4.5px] text-[#6F757A]">Order placed · Arrives in 3 days</p>
                      <div className="mt-1.5 flex h-[14px] items-center justify-center rounded-full bg-[#6E56F8] text-[5.5px] font-medium text-white">
                        Track order
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-left">
                        <div className="size-4 shrink-0 overflow-hidden rounded">
                          <ProductImage src="/shopify-jp/knit-model.jpg" alt={CAPTION_TEXT} />
                        </div>
                        <span className="flex-1 text-[4.5px] text-[#15181A]">{CAPTION_TEXT}</span>
                        <span className="text-[4.5px] font-medium text-[#15181A]">$125.00</span>
                      </div>
                      <p className="mt-1.5 text-left text-[4.5px] leading-[1.5] text-[#6F757A]">
                        Jordan Chen
                        <br />
                        1500 Saint St, Apt 12
                        <br />
                        Portland, OR 97205
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* HeroCluster — S1–S2 は scale 1.8 で「画面いっぱいの chat」、S3 で phone 画面サイズへ収束 */}
              <motion.div
                initial={false}
                animate={{
                  scale: t >= IDX.zoomOut ? 1 : 1.8,
                  y: t >= IDX.zoomOut ? 0 : 8,
                  opacity: vis(0, IDX.carousel) ? 1 : 0,
                }}
                transition={{
                  scale: k === "zoomOut" ? { duration: 0.5, ease: EASE_OUT_CUBIC } : INSTANT,
                  y: k === "zoomOut" ? { duration: 0.5, ease: EASE_OUT_CUBIC } : INSTANT,
                  opacity: tr(vis(0, IDX.carousel), INSTANT, IDX.carousel, {
                    duration: 0.4,
                    ease: "linear",
                  }),
                }}
                className="absolute left-[7%] right-[7%] top-[25%] z-20 h-[44%]"
              >
                {/* teal→青みの hue shift glow（pill 展開と同時） */}
                <motion.div
                  initial={false}
                  animate={{ opacity: vis(IDX.caret, IDX.bubble) ? 0.6 : 0 }}
                  transition={tr(
                    vis(IDX.caret, IDX.bubble),
                    { duration: 0.5, ease: "linear" },
                    IDX.bubble,
                    { duration: 0.6, ease: "linear" },
                  )}
                  className="absolute -inset-[28%] rounded-full bg-[radial-gradient(closest-side,rgba(64,128,255,0.32)_0%,rgba(20,128,118,0.14)_55%,transparent_100%)]"
                />

                {/* D1: S1 浮遊 sweater — SVG → 実写物撮り写真に差し替え */}
                <motion.div
                  initial={false}
                  animate={{ opacity: vis(0, IDX.bubble) ? 1 : 0 }}
                  transition={tr(
                    vis(0, IDX.bubble),
                    { duration: 1, ease: "linear" },
                    IDX.bubble,
                    { duration: 0.5, ease: "linear" },
                  )}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={running ? { y: [-3, 3, -3], rotate: [-1.5, 1.5, -1.5] } : { y: 0, rotate: 0 }}
                    transition={running ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" } : INSTANT}
                    className="relative flex h-[80%] w-[76%] items-center justify-center"
                  >
                    <img
                      src="/shopify-jp/knit-still-black.jpg"
                      alt="deep green knit sweater"
                      loading="lazy"
                      className="mx-auto h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
                    />
                  </motion.div>
                </motion.div>

                {/* D2: S2 商品 card — gradient+SVG → 実写モデル着用写真に差し替え */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: t >= IDX.bubble ? 1 : 0,
                    scale: t >= IDX.bubble ? 1 : 0.96,
                  }}
                  transition={
                    t >= IDX.bubble ? { duration: 0.5, ease: EASE_OUT_CUBIC } : INSTANT
                  }
                  className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                >
                  <ProductImage src="/shopify-jp/knit-model.jpg" alt="Forest Knit Sweater model" />
                </motion.div>

                {/* caption — 商品名 typewriter（card 左下の外側） */}
                <TypeText
                  text={CAPTION_TEXT}
                  mode={captionMode}
                  durationMs={1000}
                  className="absolute -bottom-[13%] left-[2%] block text-[6.5px] text-white/85"
                />

                {/* ChatPill — キャレット → 入力バー → 送信済み bubble の単一要素 morph */}
                <motion.div
                  initial={false}
                  animate={PILL_POSE[pillPhase]}
                  transition={PILL_TRANS[pillPhase]}
                  className="absolute z-20 min-h-[24px] overflow-hidden bg-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] will-change-transform"
                >
                  <TypeText
                    text={MSG}
                    mode={msgMode}
                    durationMs={1000}
                    className="block px-2 py-1.5 pr-7 text-[8px] font-medium leading-[1.4] text-[#15181A]"
                  />
                  {/* send ボタン（pop-in → bubble で灰色小型化） */}
                  <motion.span
                    initial={false}
                    animate={
                      sendPhase === "hidden"
                        ? { scale: 0, backgroundColor: "#101415", color: "#FFFFFF" }
                        : sendPhase === "ink"
                          ? { scale: 1, backgroundColor: "#101415", color: "#FFFFFF" }
                          : { scale: 0.75, backgroundColor: "#D9DCDF", color: "#5C636A" }
                    }
                    transition={
                      sendPhase === "ink"
                        ? { duration: 0.2, ease: EASE_OUT_CUBIC }
                        : sendPhase === "gray"
                          ? { duration: 0.35, ease: EASE_OUT_CUBIC }
                          : INSTANT
                    }
                    className="absolute bottom-1 right-1 flex size-[18px] items-center justify-center rounded-full"
                  >
                    <svg viewBox="0 0 10 12" className="h-[9px] w-[8px]" aria-hidden="true">
                      <path
                        d="M5 10.5V2M1.8 5 5 1.8 8.2 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Constellation — S6 で中心→外周の時差 fade-in、S7 で Thank you 面へ crossfade */}
          <div className="absolute inset-0">
            {CONSTELLATION.map((c) => (
              <motion.div
                key={c.left + c.top}
                initial={false}
                animate={{ opacity: constOn ? DEPTH_OPACITY[c.depth] : 0 }}
                transition={
                  constOn ? { duration: 0.6, delay: c.delay, ease: EASE_OUT_CUBIC } : INSTANT
                }
                style={{ left: c.left, top: c.top, width: c.width }}
                className={`absolute ${DEPTH_CLASS[c.depth]}`}
              >
                {/* idle drift（外向きの微小往復。blur はアニメしない） */}
                <motion.div
                  animate={running && constOn ? { x: [0, c.dx, 0], y: [0, c.dy, 0] } : { x: 0, y: 0 }}
                  transition={
                    running && constOn
                      ? { duration: c.dur, repeat: Infinity, ease: "easeInOut" }
                      : INSTANT
                  }
                  className={`relative ${c.depth === "near" ? "aspect-[4/5]" : "aspect-[9/17]"}`}
                >
                  {/* D10: CheckoutFace → ライトモード chat UI 風モック */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: tyOn ? 0 : 1 }}
                    transition={k === "thankYou" ? { duration: 0.5, ease: "linear" } : INSTANT}
                    className="absolute inset-0"
                  >
                    <CheckoutFace accent={c.accent} />
                  </motion.div>
                  {/* D11: ThankYouFace → 実写ポートレート + 白チェック丸 */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: tyOn ? 1 : 0 }}
                    transition={k === "thankYou" ? { duration: 0.5, ease: "linear" } : INSTANT}
                    className="absolute inset-0"
                  >
                    <ThankYouFace name={c.name} portrait={c.portrait} />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* BlackVeil — S7 末尾の暗転 + ループ継ぎ目の呼吸 */}
        <motion.div
          initial={false}
          animate={{ opacity: k === "blackout" ? 1 : 0 }}
          transition={k === "sweaterIn" ? { duration: 0.45, ease: "linear" } : INSTANT}
          className="pointer-events-none absolute inset-0 z-50 bg-[#02090A]"
        />
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* Section 本体                                                      */
/* ---------------------------------------------------------------- */

// TODO(measure): スクロール進入時の section reveal は「無し」と推定（animations.json に該当なし）
// → reveal は実装しない。実測で確認後に必要なら useRevealInView を足す。
export function SpChatSection() {
  return (
    <SpSection id="03-chat" bg="dark" className="py-16">
      <SpContainer>
        <div className="relative grid grid-cols-1 overflow-hidden rounded-2xl bg-[#061A1C] after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_1px_0_0_rgba(64,71,77,0.4)] after:content-[''] md:grid-cols-2 md:bg-[linear-gradient(290.7deg,#061A1C_58.79%,#0D3A2D_100%)]">
          {/* 左列: アイコン群 + テキスト */}
          <div className="flex flex-col gap-4 p-6 md:justify-between md:p-10">
            <div className="flex" aria-label="AI チャネル">
              {AI_CHANNELS.map((channel, i) => (
                <span
                  key={channel.name}
                  title={channel.name}
                  style={{ zIndex: AI_CHANNELS.length - i }}
                  className={`relative flex size-10 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.3),0_5px_10px_rgba(0,0,0,0.2)] md:size-14 ${
                    i > 0 ? "-ml-4" : ""
                  }`}
                >
                  {channel.glyph}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-balance text-[clamp(34px,3.8vw,55px)] leading-[1.16] font-[330] text-white">
                {HEADING}
              </h2>
              <p className="text-[16px] leading-[23px] text-sp-gray lg:max-w-[75%]">
                {PARAGRAPH_BEFORE_LINK}
                <SpTextLink href="#agent-storefront">{PARAGRAPH_LINK}</SpTextLink>
                {PARAGRAPH_AFTER_LINK}
              </p>
            </div>
          </div>

          {/* 右列: チャットデモ（本家 webm の DOM モック） */}
          <div className="flex items-center justify-center pt-6 md:p-0">
            <div className="aspect-[2090/1742] w-full">
              <ChatDemoMock />
            </div>
          </div>
        </div>
      </SpContainer>
    </SpSection>
  );
}
