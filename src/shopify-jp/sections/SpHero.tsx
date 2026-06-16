import { useEffect, useReducer, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";

/** 実測値: 450ms / cubic-bezier(0.5,0,0.5,1) / 3000ms hold / 縦 ±400px + fade、1 巡で停止。
    「行列のできるストア」は mobile 実測 2026-06-10 で確認した追加語 */
const ROTATING_WORDS = [
  "個人起業家",
  "行列のできるストア",
  "カテゴリークリエイター",
  "世界的企業",
  "AI のオールスター",
];
const HOLD_MS = 3000;
const SWAP_EASE = [0.5, 0, 0.5, 1] as const;

/* 回転ワード連動の背景動画（本家挙動の再現）。素材は Higgsfield 生成
   （4K マスター = design/reference/higgsfield-req/、配信は 1080p 圧縮版） */
type HeroMediaKey = "phone-joy" | "morning" | "rio" | "warehouse-br" | "mascara";
interface HeroMedia {
  key: HeroMediaKey;
  src: string;
  poster: string;
}
const HERO_MEDIA: readonly HeroMedia[] = [
  { key: "phone-joy", src: "/shopify-jp/hero-phone-joy.mp4", poster: "/shopify-jp/hero-phone-joy.jpg" },
  { key: "morning", src: "/shopify-jp/hero-morning.mp4", poster: "/shopify-jp/hero-morning.jpg" },
  { key: "rio", src: "/shopify-jp/hero-rio-celebration.mp4", poster: "/shopify-jp/hero-rio-celebration.jpg" },
  { key: "warehouse-br", src: "/shopify-jp/hero-warehouse-br.mp4", poster: "/shopify-jp/hero-warehouse-br.jpg" },
  { key: "mascara", src: "/shopify-jp/hero-mascara.mp4", poster: "/shopify-jp/hero-mascara.jpg" },
];
/* 語 → メディアキー（全 5 語に固有動画。素材は Higgsfield 生成、4K マスター保管済み） */
const WORD_MEDIA: Record<string, HeroMediaKey> = {
  個人起業家: "phone-joy",
  行列のできるストア: "morning",
  カテゴリークリエイター: "rio",
  世界的企業: "warehouse-br",
  "AI のオールスター": "mascara",
};

/* copy は学習用の独自文（本家の文章の逐語コピーではない） */
const COPY = {
  lead: "大きな夢を、最速の立ち上げで。世界中の事業者に選ばれる Shopify で、今日から実現を。",
  ctaPrimary: "無料で始める",
  ctaSecondary: "Shopifyが開発されるまで",
};

export function SpHero() {
  const reduced = useReducedMotion();
  const [index, advance] = useReducer(
    (i: number) => Math.min(i + 1, ROTATING_WORDS.length - 1),
    0,
  );
  // 本家 mobile 実測: 回転語は折返し許可（clip なし）→ 縦移動量を md 未満では 24px に抑える
  const [isMdUp, setIsMdUp] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setIsMdUp(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
    };
  }, []);
  const travel = isMdUp ? 400 : 24;

  useEffect(() => {
    if (reduced) return;
    if (index >= ROTATING_WORDS.length - 1) return;
    const t = setTimeout(advance, HOLD_MS + 450);
    return () => { clearTimeout(t); };
  }, [index, reduced]);

  const word = reduced ? ROTATING_WORDS[ROTATING_WORDS.length - 1] : ROTATING_WORDS[index];
  const activeMedia: HeroMediaKey = WORD_MEDIA[word ?? ""] ?? "phone-joy";

  return (
    <section id="top" className="relative -mt-[72px] h-[851px] overflow-hidden bg-sp-dark">
      {/* 背景: 回転ワード連動の動画 3 層を crossfade。reduced-motion 時は静止画のみ */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_38%,#5a4334_0%,#2c2521_34%,#0a1112_68%,#02090a_100%)]" />
        {reduced ? (
          <img
            src="/shopify-jp/hero-bg.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          HERO_MEDIA.map((m) => (
            <video
              key={m.key}
              data-hero-video={m.key}
              src={m.src}
              poster={m.poster}
              autoPlay
              loop
              muted
              playsInline
              preload={m.key === "phone-joy" ? "auto" : "metadata"}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
                m.key === activeMedia ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,9,10,0.92)_0%,rgba(2,9,10,0.55)_38%,rgba(2,9,10,0.05)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/60" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1520px] flex-col px-8 pt-[300px] [font-feature-settings:normal] lg:px-[90px]">
        {/* 本家 mobile 実測: 60px/60px・回転語は折返し（clip は md+ のみ） */}
        <h1 className="text-[clamp(60px,6.7vw,96px)] leading-[1.03] font-normal text-white">
          目指せ、次の
          <br className="hidden md:block" />
          <span className="inline md:block md:h-[1em] md:overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={word}
                className="inline md:inline-block"
                initial={{ y: travel, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -travel, opacity: 0 }}
                transition={{ duration: 0.45, ease: SWAP_EASE }}
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <p className="mt-7 max-w-[15.5em] text-[24px] leading-[1.17] text-white">{COPY.lead}</p>

        {/* desktop: pill CTA ×2 */}
        <div className="mt-7 hidden items-center gap-4 md:flex">
          <button
            type="button"
            className="rounded-full bg-white px-6 py-[14px] text-[18px] font-[550] text-black transition-transform duration-200 hover:scale-[1.03]"
          >
            {COPY.ctaPrimary}
          </button>
          <button
            type="button"
            className="flex items-center gap-[26px] rounded-full pr-[26px] text-[18px] font-[550] text-white transition-colors hover:bg-white/10"
          >
            <span className="flex size-[55px] items-center justify-center rounded-full border border-white/40">
              <Play className="size-4 fill-white" />
            </span>
            {COPY.ctaSecondary}
          </button>
        </div>

        {/* mobile: email lead form（本家 mobile 実測 2026-06-10） */}
        <div className="mt-7 flex flex-col gap-3 md:hidden">
          <p className="text-[12px] text-white/70">マーケティングメールの受信に同意します。</p>
          <input
            type="email"
            placeholder="メールアドレスを入力してください"
            className="h-12 rounded-full border border-white/40 bg-black/40 px-5 text-[15px] text-white placeholder:text-white/50"
          />
          <button type="button" className="h-12 rounded-full bg-white text-[16px] font-[550] text-black">
            {COPY.ctaPrimary}
          </button>
          <button
            type="button"
            className="mx-auto mt-1 flex items-center gap-2 text-[15px] font-[550] text-white"
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-white/40">
              <Play className="size-3.5 fill-white" />
            </span>
            {COPY.ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
}
