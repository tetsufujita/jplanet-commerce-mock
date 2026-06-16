import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BarChart3, Home, Megaphone, Package, Search, ShoppingCart, Users } from "lucide-react";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpSectionHeading } from "@/shopify-jp/ui/SpSectionHeading";
import { SpCaptionBlock } from "@/shopify-jp/ui/SpCaptionBlock";
import { SpDarkCard } from "@/shopify-jp/ui/SpDarkCard";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";

/** §7 Sidekick — 紫グラデ地 + デモカード(2fr) / 事例カード(1fr)。spec: specs/07-sidekick.md */

const COPY = {
  h2: "秘密兵器、Sidekick の登場です",
  demoTitle: "あなた専属のコマース AI",
  demoLink: "Sidekick",
  demoBodyAfter:
    " が成長のヒントを提案し、手間のかかる作業を肩代わりします。管理画面にはじめから組み込まれています。",
  caseTitle: "ビジネス成功のカタチ",
  caseBody:
    "Sidekick とともに事業をすばやく、賢く育てているブランドの実例ストーリーをご覧ください。",
  playAria: "事例動画を再生する",
  chatUser: "先週いちばん伸びた商品は？",
  chatReply:
    "『リネンシャツ』が前週比 +38%。在庫が残り 12 点なので補充をおすすめします",
} as const;

const LOOP_SEC = 8;
const FADE_OUT = 0.94;

/** 本家実測（shot 画素計測）: caption h ≈20px / p ≈18px・行ピッチ ≈23px → 共有 SpCaptionBlock を className で上書き */
const CAPTION_TYPE = "[&>h4]:text-[20px] [&>p]:text-[18px] [&>p]:leading-[1.3]";

/** 8s ループ内の一点で出現し、末尾で全員フェードアウトする chat 要素 */
function LoopItem({
  at,
  reduced,
  className = "",
  children,
}: {
  at: number;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  const t = Math.min(at + 0.04, FADE_OUT - 0.02);
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: [0, 0, 1, 1, 0], y: [6, 6, 0, 0, 0] }}
      transition={{
        duration: LOOP_SEC,
        repeat: Infinity,
        ease: "easeOut",
        times: [0, at, t, FADE_OUT, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/** Sidekick きらめき icon（4 芒星 + 小星、白）。2s opacity 明滅 */
// TODO(measure): 本家 sparkle icon の実体（lottie/canvas?）と正確な micro アニメ（M5）
function SparkleIcon({ reduced, className = "" }: { reduced: boolean; className?: string }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      animate={reduced ? undefined : { opacity: [1, 0.35, 1] }}
      transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M10.5 3.5 L12.3 9.2 L18 11 L12.3 12.8 L10.5 18.5 L8.7 12.8 L3 11 L8.7 9.2 Z"
        fill="#FFFFFF"
      />
      <path d="M18 14.5 L18.9 17 L21.4 17.9 L18.9 18.8 L18 21.3 L17.1 18.8 L14.6 17.9 L17.1 17 Z" fill="#FFFFFF" />
    </motion.svg>
  );
}

/** Card A メディア: 偽 admin（sidebar + dashboard + Sidekick chat）DOM mock */
function AdminDemoMock({ reduced }: { reduced: boolean }) {
  const navItems: readonly (readonly [typeof Home, string])[] = [
    [Home, "ホーム"],
    [ShoppingCart, "注文管理"],
    [Package, "商品管理"],
    [Users, "顧客管理"],
    [BarChart3, "ストア分析"],
    [Megaphone, "マーケティング"],
  ];
  const bars: readonly { h: string; at: number; accent: boolean }[] = [
    { h: "38%", at: 0.46, accent: false },
    { h: "52%", at: 0.5, accent: false },
    { h: "44%", at: 0.54, accent: false },
    { h: "68%", at: 0.58, accent: false },
    { h: "100%", at: 0.62, accent: true },
  ];

  return (
    <div className="absolute inset-0 flex bg-[#101415] text-[11px]">
      {/* sidebar */}
      <div className="hidden w-[21%] shrink-0 flex-col gap-0.5 border-r border-white/5 bg-[#15191A] px-3 py-3 sm:flex">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-sp-avocado/20 text-[10px] font-bold text-sp-avocado">
            k
          </span>
          <span className="font-medium text-white/85">konoha</span>
        </div>
        {navItems.map(([Icon, label], i) => (
          <span
            key={label}
            className={`flex items-center gap-2 rounded-md px-2 py-1 ${
              i === 0 ? "bg-white/10 text-white/90" : "text-white/45"
            }`}
          >
            <Icon size={12} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>

      {/* main dashboard（dim） */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex h-7 items-center gap-2 rounded-lg bg-white/5 px-3 text-white/35">
          <Search size={12} strokeWidth={1.75} aria-hidden="true" />
          検索
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-white/45">本日の売上</p>
            <p className="mt-1 text-[15px] font-semibold text-white/85">¥182,400</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-white/45">注文</p>
            <p className="mt-1 text-[15px] font-semibold text-white/85">64 件</p>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-white/[0.04] p-3">
          <p className="text-white/45">ストア分析</p>
          <svg
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-x-3 bottom-2 h-12 w-[calc(100%-24px)]"
          >
            <polyline
              points="0,48 30,42 60,44 90,30 120,34 150,18 200,8"
              fill="none"
              stroke="#36F4A4"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
            <line x1="0" y1="56" x2="200" y2="56" stroke="#FFFFFF" strokeOpacity="0.12" />
          </svg>
        </div>
      </div>

      {/* Sidekick chat panel */}
      <div className="flex w-[38%] shrink-0 flex-col border-l border-white/5 bg-[#0B0F10]">
        <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2 font-medium text-white/85">
          <SparkleIcon reduced={reduced} className="size-4" />
          Sidekick
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
          {/* user bubble */}
          <LoopItem at={0.05} reduced={reduced} className="self-end">
            <p className="max-w-[15em] rounded-xl rounded-br-sm bg-[#26302E] px-3 py-2 text-white/90">
              {COPY.chatUser}
            </p>
          </LoopItem>

          {/* typing indicator（reduced 時は非表示） */}
          {!reduced ? (
            <motion.div
              className="flex gap-1 self-start px-1"
              initial={false}
              animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
              transition={{
                duration: LOOP_SEC,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.13, 0.16, 0.24, 0.27, 1],
              }}
              aria-hidden="true"
            >
              <span className="size-1.5 rounded-full bg-white/40" />
              <span className="size-1.5 rounded-full bg-white/40" />
              <span className="size-1.5 rounded-full bg-white/40" />
            </motion.div>
          ) : null}

          {/* Sidekick reply */}
          <LoopItem at={0.28} reduced={reduced} className="self-start">
            <p className="max-w-[18em] rounded-xl rounded-bl-sm bg-white/[0.06] px-3 py-2 leading-[1.7] text-white/80">
              {COPY.chatReply}
            </p>
          </LoopItem>

          {/* 売上 mini カード（bar が stagger で立ち上がる） */}
          <LoopItem at={0.42} reduced={reduced} className="self-start w-full max-w-[18em]">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-white/55">リネンシャツ / 週次売上</span>
                <span className="font-semibold text-sp-avocado">+38%</span>
              </div>
              <div className="mt-2 flex h-10 items-end gap-1.5">
                {bars.map((b, i) =>
                  reduced ? (
                    <div
                      key={i}
                      style={{ height: b.h }}
                      className={`w-full rounded-sm ${b.accent ? "bg-sp-avocado" : "bg-white/20"}`}
                    />
                  ) : (
                    <motion.div
                      key={i}
                      style={{ height: b.h, transformOrigin: "bottom" }}
                      className={`w-full rounded-sm ${b.accent ? "bg-sp-avocado" : "bg-white/20"}`}
                      initial={false}
                      animate={{ scaleY: [0, 0, 1, 1, 0] }}
                      transition={{
                        duration: LOOP_SEC,
                        repeat: Infinity,
                        ease: "easeOut",
                        times: [0, b.at, b.at + 0.06, FADE_OUT, 1],
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          </LoopItem>
        </div>

        {/* input bar */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-white/35">
            <SparkleIcon reduced={reduced} className="size-3.5 opacity-60" />
            Sidekick に質問
          </div>
        </div>
      </div>
    </div>
  );
}

/** Card B poster: 暗い店舗 × 架空 founder の CSS/SVG mock（生成画像が来るまでの代替） */
function FounderPosterMock() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#241a10_0%,#0d0a07_55%,#050403_100%)]" />
      {/* 棚を示唆する faint line */}
      <div className="absolute top-[22%] right-0 left-0 h-px bg-white/10" />
      <div className="absolute top-[40%] right-0 left-0 h-px bg-white/[0.06]" />
      {/* 暖色の光源 */}
      <div className="absolute -top-8 -left-8 size-52 rounded-full bg-[#8a5a24]/30 blur-3xl" />
      {/* founder silhouette（抽象） */}
      <div className="absolute bottom-[-6%] left-1/2 -translate-x-1/2">
        <div className="mx-auto size-16 rounded-full bg-[#0a0805]" />
        <div className="-mt-2 h-40 w-44 rounded-t-[60px] bg-[#0a0805]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,transparent_55%,rgba(0,0,0,0.65)_100%)]" />
      <span className="absolute bottom-4 left-5 text-[12px] tracking-[0.3em] text-white/40">
        konoha
      </span>
    </div>
  );
}

/** 再生三角（19×21, stroke 1.65, 本家 path を参考に自作） */
function PlayTriangle({ className = "" }: { className?: string }) {
  return (
    <svg
      width="19"
      height="21"
      viewBox="0 0 19 21"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.2 3.1 L16.2 10.5 L3.2 17.9 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpSidekick() {
  const reduced = useReducedMotion() ?? false;
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <SpSection id="07-sidekick" bg="dark">
      {/* 紫→濃紺の縦 grad + 上角丸。背後に sp-dark が見える仕掛け */}
      {/* TODO(measure): rounded-t-5xl の正確な radius（視認 ≈ 32px 仮置き） */}
      {/* TODO(measure): section 入場アニメは「なし」と推定（M6）。IntersectionObserver 系が見つかれば追加 */}
      <div className="rounded-t-[32px] bg-[linear-gradient(to_bottom,#2C007F_42.49%,#000A1D_100%)] py-16 md:py-[100px]">
        <SpContainer>
          <SpSectionHeading title={COPY.h2} className="pb-12 md:pb-20" />

          {/* 実測: カード全高 ≈535px（media ≈380px + caption）→ media 行を明示確保 */}
          {/* 実測: 本家はメディア行と caption 行の間に row-gap なし（caption 上端 ≈ card top+368px）→ md は列 gap のみ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr] md:grid-rows-[minmax(380px,1fr)_auto] md:gap-x-6 md:gap-y-0">
            {/* Card A — Sidekick デモ */}
            {/* TODO(measure): shadow-card の実値（SpDarkCard の影で代替中） */}
            <SpDarkCard radius="xl" className="md:row-span-2 md:grid md:grid-rows-subgrid">
              <div className="pointer-events-none absolute inset-0 bg-[#020A08]" aria-hidden="true" />
              {/* メディア: 実測 aspect 2017/872、subgrid row1 を満たす */}
              <motion.div
                className="relative aspect-[2017/872] min-h-0 md:aspect-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                <AdminDemoMock reduced={reduced} />
              </motion.div>
              {/* caption */}
              <div className="relative p-6 sm:p-8 lg:max-w-[75%]">
                <SpCaptionBlock
                  className={CAPTION_TYPE}
                  title={
                    <span className="inline-flex items-center gap-2">
                      {COPY.demoTitle}
                      <SparkleIcon reduced={reduced} className="size-6" />
                    </span>
                  }
                >
                  <SpTextLink href="#">{COPY.demoLink}</SpTextLink>
                  {COPY.demoBodyAfter}
                </SpCaptionBlock>
              </div>
            </SpDarkCard>

            {/* Card B — 事例（クリック再生型・stub） */}
            <SpDarkCard radius="xl" className="md:row-span-2 md:grid md:grid-rows-subgrid">
              <div className="pointer-events-none absolute inset-0 bg-[#020A08]" aria-hidden="true" />
              {/* メディア: mobile は 930/828、md+ は row1 に従って伸縮（min-h-0） */}
              <div className="relative aspect-[930/828] min-h-0 md:aspect-auto">
                <FounderPosterMock />
                {/* 生成済み founder poster（Higgsfield 新規生成）。mock は読込前 fallback */}
                <img
                  src="/shopify-jp/founder-e2.jpg"
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
                {/* TODO(measure): click 再生時の遷移（button fade / video fade-in 時間 / 終了時挙動 = M4） */}
                {!isPlaying ? (
                  <button
                    type="button"
                    aria-label={COPY.playAria}
                    onClick={() => { setIsPlaying(true); }}
                    className="group absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex size-[63px] items-center justify-center rounded-full border-[1.89px] border-[#E3E3E8]/80 bg-black/20 text-[#E3E3E8] shadow-[0_1.5px_9px_rgba(0,0,0,0.3)] transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-black group-focus-visible:border-white group-focus-visible:bg-white group-focus-visible:text-black">
                      <PlayTriangle className="ml-0.5" />
                    </span>
                  </button>
                ) : null}
              </div>
              {/* caption */}
              <div className="relative max-w-[65ch] p-6 sm:p-8">
                <SpCaptionBlock className={CAPTION_TYPE} title={COPY.caseTitle}>
                  {COPY.caseBody}
                </SpCaptionBlock>
              </div>
            </SpDarkCard>
          </div>
        </SpContainer>
      </div>
    </SpSection>
  );
}
