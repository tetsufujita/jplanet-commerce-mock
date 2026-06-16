import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpSectionHeading } from "@/shopify-jp/ui/SpSectionHeading";
import { SpTextLink } from "@/shopify-jp/ui/SpTextLink";
import { SpGlowEllipse } from "@/shopify-jp/ui/SpGlowEllipse";
import { useRevealInView } from "@/shopify-jp/ui/hooks";

/* copy は学習用 paraphrase（本家の逐語コピーではない）。機能ラベルのみ原文 */
const COPY = {
  headingL1: "開発者による",
  headingL2: "開発者のためのリソース",
  leadBefore: "Shopify が公開する",
  leadLink1: "ユニバーサルコマースプロトコル",
  leadMid: "に加え、",
  leadLink2: "API・ツール・プリミティブ",
  leadAfter:
    "を使えば、開発者は事業に必要なエージェンティックコマース体験を自在に組み立てられます。",
  pillAi: "AI 向けに構築",
  pillStorefront: "カスタムストアフロントを構築",
  pillApps: "アプリを構築",
  srHydrangea: "Hydrangea：ヘッドレスコマースのフレームワーク",
  srDevs: "devs.example",
} as const;

/* 装飾コード SVG の疑似コード（完全新規・本家 asset 不使用） */
const CODE_LEFT = [
  "const cart = agent.checkout({",
  '  storefront: "konoha",',
  "  lines: picks.map(toVariant),",
  "});",
  "",
  "await cart.commit();",
] as const;
const CODE_RIGHT = [
  "mutation cartCreate(",
  "  $lines: [LineInput!]",
  ") {",
  "  cart { id checkoutUrl }",
  "}",
] as const;
const CODE_TOP = ['agent.on("intent:purchase", resolveOffer) // konoha runtime'] as const;
const CODE_BOTTOM = [
  "export const offer = defineOffer({",
  '  sku: "KNH-001", price: 4200, currency: "JPY",',
  "});",
] as const;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type GlowVars = CSSProperties & {
  offsetPath?: string;
  offsetRotate?: string;
  "--sp-glow-from"?: string;
  "--sp-glow-to"?: string;
};

interface GlowSpec {
  /** offset-distance 始点（animations.json 実測 keyframe） */
  from: string;
  /** offset-distance 終点 */
  to: string;
  /** stagger delay */
  delay: string;
}

/** 薄いコード行 SVG（白 8–15% opacity の線画相当） */
function CodeSvg({
  w,
  h,
  lines,
  className = "",
}: {
  w: number;
  h: number;
  lines: readonly string[];
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      width={w}
      height={h}
      className={`pointer-events-none absolute ${className}`}
    >
      {lines.map((line, i) => (
        <text
          key={i}
          x={2}
          y={16 + i * 19}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize={12}
          className="fill-white/[0.07]"
        >
          {line}
        </text>
      ))}
    </svg>
  );
}

/** label pill（hidden lg:inline-flex、実測高 46px） */
function DevPill({ label }: { label: string }) {
  return (
    // TODO(measure): shadow-dev-label-container の実値 / text-b4 の正確な size・weight
    <a
      href="#"
      className="mb-4 hidden items-center gap-3 rounded bg-white/20 px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-colors duration-150 hover:bg-[#4A659A] lg:inline-flex"
    >
      <span aria-hidden className="size-2 rounded-full border-2 border-white" />
      <span className="text-[14px] leading-[22px] font-[450] text-white">{label}</span>
    </a>
  );
}

/** dev card 共通フレーム: 白/10 枠 13px + #060607 内側 + border-glow（周回光） */
function DevCard({
  corner,
  glow,
  play,
  children,
}: {
  corner: "t" | "tl";
  glow: GlowSpec;
  play: boolean;
  children: ReactNode;
}) {
  const outerRadius = corner === "t" ? "rounded-t-[20px]" : "rounded-tl-[20px] rounded-tr-[9px]";
  const innerRadius = corner === "t" ? "rounded-t-xl" : "rounded-tl-xl";
  // TODO(measure): 光の色・長さ・offset-path 定義は仮（M1）。負値 offset-distance の wrap 挙動も要確認
  const dotStyle: GlowVars = {
    offsetPath: "rect(0% 100% 100% 0% round 20px)",
    offsetRotate: "auto",
    "--sp-glow-from": glow.from,
    "--sp-glow-to": glow.to,
    animation: `sp-devs-border-glow 8s linear ${glow.delay} infinite`,
    animationPlayState: play ? "running" : "paused",
  };
  return (
    <div className={`relative border border-white/10 bg-white/10 p-[13px] ${outerRadius}`}>
      <span aria-hidden className={`pointer-events-none absolute -inset-px ${outerRadius}`}>
        <span
          className="absolute h-[3px] w-[90px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(148,196,255,0.95),transparent)] opacity-0 shadow-[0_0_12px_2px_rgba(96,165,250,0.5)] motion-reduce:hidden"
          style={dotStyle}
        />
      </span>
      <div className={`overflow-hidden bg-[#060607] pb-10 text-left ${innerRadius}`}>{children}</div>
    </div>
  );
}

/* ---- mock 中身（本家 CDN 画像の代替 DOM、いずれも装飾） ---- */

function MockStorefront() {
  return (
    <div aria-hidden className="aspect-[600/389] w-full bg-[#070709]">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
        <span className="text-[13px] font-[600] tracking-[0.25em] text-white/25">KONOHA</span>
        <div className="flex gap-5 text-[10px] text-white/15">
          <span>新作</span>
          <span>コレクション</span>
          <span>ジャーナル</span>
        </div>
        <div className="flex gap-2">
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/[0.07]" />
        </div>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-5 p-6">
        <div className="aspect-[4/3] rounded-md bg-[radial-gradient(80%_80%_at_30%_20%,#101117_0%,#08080c_100%)]" />
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-3 w-3/4 rounded bg-white/[0.05]" />
          <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
          <div className="h-3 w-1/3 rounded bg-white/[0.06]" />
          <div className="mt-3 h-9 w-2/3 rounded-full bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
}

function MockAiChat() {
  return (
    <div aria-hidden className="h-[360px] w-full bg-[#070709] px-4 pt-4">
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/[0.08]" />
      <div className="mb-3 ml-auto w-3/4 rounded-2xl rounded-br-sm bg-white/[0.05] p-3">
        <div className="h-2 w-full rounded bg-white/[0.07]" />
        <div className="mt-2 h-2 w-2/3 rounded bg-white/[0.07]" />
      </div>
      <div className="mb-3 w-5/6 rounded-2xl rounded-bl-sm bg-[#0b0d13] p-3">
        <div className="h-2 w-full rounded bg-white/[0.05]" />
        <div className="mt-2 h-2 w-4/5 rounded bg-white/[0.05]" />
        <div className="mt-2 h-2 w-1/2 rounded bg-white/[0.05]" />
      </div>
      <div className="mt-5 flex h-10 items-center rounded-full bg-white/[0.04] px-4">
        <div className="h-2 w-1/2 rounded bg-white/[0.05]" />
      </div>
    </div>
  );
}

function MockAdmin() {
  return (
    <div aria-hidden className="flex aspect-[920/416] w-full bg-[#070709]">
      <div className="w-[30%] border-r border-white/[0.04] p-4">
        <div className="mb-4 h-3 w-2/3 rounded bg-white/[0.06]" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-3 flex items-center gap-2">
            <span className="size-2.5 rounded bg-white/[0.05]" />
            <div className="h-2 w-3/5 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-3 w-1/3 rounded bg-white/[0.06]" />
          <div className="h-6 w-16 rounded-full bg-white/[0.07]" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="mb-3 grid grid-cols-[1fr_2fr_1fr] gap-3">
            <div className="h-2 rounded bg-white/[0.04]" />
            <div className="h-2 rounded bg-white/[0.03]" />
            <div className="h-2 rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** §9 開発者リソース — navy 背景 + dev canvas（3 card / 円 button ×2 / 周回 border-glow） */
export function SpDevs() {
  const reduced = useReducedMotion();
  const { ref, inView } = useRevealInView<HTMLDivElement>(0.3);
  const playGlow = inView && !reduced;

  // TODO(measure): card 入場（M6 dev-*-card）の実挙動。下から rise + stagger を仮実装
  const rise = (delay: number) => ({
    initial: false as const,
    animate:
      reduced || inView ? { y: 0, opacity: 1 } : { y: 48, opacity: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay: reduced ? 0 : delay },
  });

  return (
    <SpSection id="09-devs" bg="navy" className="pt-8 pb-24">
      <style>{`
        @keyframes sp-devs-border-glow {
          0% { offset-distance: var(--sp-glow-from); opacity: 0; }
          5% { opacity: 1; }
          35% { opacity: 1; }
          40% { offset-distance: var(--sp-glow-to); opacity: 0; }
          100% { offset-distance: var(--sp-glow-to); opacity: 0; }
        }
      `}</style>
      <SpContainer>
        {/* 見出しブロック（pb-xl 40px） */}
        <div className="max-w-[85ch] pb-10 text-balance">
          <SpSectionHeading
            title={
              <>
                {COPY.headingL1}
                <br />
                {COPY.headingL2}
              </>
            }
          />
          {/* TODO(measure): text-b3 の正確な size/lh と text-gray-d token 値。折返し幅は shot 合わせ */}
          <p className="mt-6 max-w-[29em] text-[19px] leading-[28px] text-[#BEBFCB]">
            {COPY.leadBefore}
            {/* TODO(measure): p 内 link の hover 挙動（white 化?） */}
            <SpTextLink className="text-[#BEBFCB]">{COPY.leadLink1}</SpTextLink>
            {COPY.leadMid}
            <SpTextLink className="text-[#BEBFCB]">{COPY.leadLink2}</SpTextLink>
            {COPY.leadAfter}
          </p>
        </div>

        {/* dev canvas 1260×420 */}
        {/* TODO(measure): shadow-dev-image-container の実値 */}
        <div
          ref={ref}
          className="relative h-[420px] overflow-hidden rounded-2xl bg-[#010624]"
        >
          {/* 青 glow 楕円 ×3（radial-gradient rgba(18,96,255,0.35)）。shot 実測: 上左〜中央上が最明・右上は暗 */}
          <SpGlowEllipse
            color="rgba(18,96,255,0.35)"
            className="left-[120px] top-[-200px] h-[500px] w-[1050px] opacity-90"
          />
          <SpGlowEllipse
            color="rgba(18,96,255,0.35)"
            className="left-[-260px] top-[-40px] h-[640px] w-[480px] rotate-45 opacity-90"
          />
          <SpGlowEllipse
            color="rgba(18,96,255,0.35)"
            className="left-[640px] top-[300px] h-[280px] w-[640px] opacity-80"
          />

          {/* 装飾コード SVG ×4（自作疑似コード） */}
          <CodeSvg w={312} h={128} lines={CODE_LEFT} className="left-[-12px] top-[16px]" />
          <CodeSvg w={288} h={172} lines={CODE_RIGHT} className="left-[930px] top-[-6px]" />
          <CodeSvg w={580} h={76} lines={CODE_TOP} className="left-[325px] top-[30px]" />
          <CodeSvg w={657} h={109} lines={CODE_BOTTOM} className="bottom-[-30px] left-[1000px] z-20" />

          {/* 中央: カスタムストアフロント（630px、x300 / pill y80） */}
          <motion.div className="absolute left-[300px] top-[80px] w-[630px]" {...rise(0)}>
            <DevPill label={COPY.pillStorefront} />
            <DevCard corner="t" glow={{ from: "-20%", to: "80%", delay: "1s" }} play={playGlow}>
              <MockStorefront />
            </DevCard>
          </motion.div>

          {/* 左: AI 向け（275px、中央 card に 14px 重なる） */}
          <motion.div className="absolute left-[39px] top-[132px] w-[275px]" {...rise(0.15)}>
            <DevPill label={COPY.pillAi} />
            <DevCard corner="tl" glow={{ from: "-30%", to: "60%", delay: "4s" }} play={playGlow}>
              <MockAiChat />
            </DevCard>
          </motion.div>

          {/* 右: アプリ構築（486px、canvas 右端 −36 / 中央 card に overlay） */}
          <motion.div
            className="absolute right-[35px] top-[168px] z-10 w-[486px] text-right"
            {...rise(0.3)}
          >
            <DevPill label={COPY.pillApps} />
            <div className="relative">
              {/* TODO(measure): bg-devCard token 実値（右 card のみの背板） */}
              <span
                aria-hidden
                className="absolute -inset-x-[3px] -top-[3px] bottom-0 rounded-t-[22px] bg-[#10173a]/80"
              />
              <DevCard corner="t" glow={{ from: "-30%", to: "-120%", delay: "5.5s" }} play={playGlow}>
                <MockAdmin />
              </DevCard>
            </div>
          </motion.div>

          {/* Hydrangea 円 button（cyan、hover でロゴ上下分裂） */}
          <a
            href="#"
            className="group/hydrangea absolute left-[877px] top-[80px] z-20 flex size-[73px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#30DEEE_0%,#30C0EE_100%)] shadow-[0_16px_24px_0_#070D17] transition-[transform,box-shadow] duration-200 hover:scale-110 hover:shadow-[0_0_24px_0_#30DEEE]"
          >
            {/* 2 段 chevron は自作 path（本家 d 属性の流用なし） */}
            <svg viewBox="0 0 36 38" className="w-[36px]" aria-hidden>
              <path
                d="M21.5 2H34L19.5 17.5H7L21.5 2Z"
                className="fill-[#02090A] transition-[transform,opacity] duration-300 [transform-box:fill-box] group-hover/hydrangea:translate-y-[10%] group-hover/hydrangea:opacity-40"
              />
              <path
                d="M16.5 20.5H29L14.5 36H2L16.5 20.5Z"
                className="fill-[#02090A] transition-[transform,opacity] duration-300 [transform-box:fill-box] group-hover/hydrangea:-translate-y-[10%] group-hover/hydrangea:opacity-40"
              />
            </svg>
            <span className="sr-only">{COPY.srHydrangea}</span>
          </a>

          {/* fork 円 button（purple、canvas 下端の少し上・shot 実測では切れず全表示） */}
          <a
            href="#"
            className="group/fork absolute left-[1183px] top-[340px] z-20 flex size-[71px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#6B26FF_0%,#5126FF_100%)] shadow-[0_16px_24px_rgba(7,13,23,0.1)] transition-[transform,box-shadow] duration-200 hover:scale-110 hover:shadow-[0_0_24px_#6B26FF]"
          >
            {/* TODO(measure): fork SVG の hover micro アニメ（line-up/circle/curvy/plus-wrap）の実 keyframes */}
            <svg
              viewBox="0 0 27 27"
              className="w-[27px]"
              fill="none"
              stroke="#02090A"
              strokeWidth={2.16}
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="8" cy="6" r="3" />
              <path
                d="M8 9.5V21"
                className="transition-transform duration-300 [transform-box:fill-box] group-hover/fork:-translate-y-[1.5px]"
              />
              <path d="M8 13.5c0 3.6 2.8 6 6.4 6H17" />
              <g className="origin-center transition-transform duration-300 [transform-box:fill-box] group-hover/fork:rotate-90">
                <path d="M21 16.5v6" />
                <path d="M18 19.5h6" />
              </g>
            </svg>
            <span className="sr-only">{COPY.srDevs}</span>
          </a>
        </div>
      </SpContainer>
    </SpSection>
  );
}
