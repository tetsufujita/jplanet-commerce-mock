# Codex Phase 2 — Top page Hero detailed prompt

> SENTINEL AI prompt と同じ密度で Andes Top hero を実装するための prompt。
> Phase 0 (scaffold) と Phase 1 (foundation: i18n / theme / Header / Footer) が完了している前提。
> 本 file の「貼り付け本文」を Codex に渡す。

---

## 貼り付け本文（Codex に渡す）

```
Andes Inc. corporate site の Top page Hero を実装する。
Phase 0 (Next.js scaffold) と Phase 1 (i18n / theme / Header / Footer) は完了している前提。
React 19 + Next.js 15 (App Router) + TypeScript strict + Tailwind v4 + next-intl を使う。

以下、すべての detail。

FONT:
Google Fonts を next/font/google で import (src/app/[locale]/layout.tsx):

  import { Geist, Inter, Noto_Sans_JP } from "next/font/google";
  const geist  = Geist({ subsets:["latin"], weight:["300","400","500","600","700"], variable:"--font-display" });
  const inter  = Inter({ subsets:["latin"], weight:["400","500","600"], variable:"--font-body" });
  const notoJP = Noto_Sans_JP({ subsets:["latin"], weight:["400","500","700"], variable:"--font-jp" });

body に `${geist.variable} ${inter.variable} ${notoJP.variable} font-body antialiased` を当てる。
ja locale のときだけ body に `font-jp` を追加 (locale 判定で切り替え)。

Tailwind config theme:
  fontFamily: {
    display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
    body:    ["var(--font-body)",    "ui-sans-serif", "system-ui"],
    jp:      ["var(--font-jp)",      "ui-sans-serif", "system-ui"],
  }

COLOR THEME (light base、全 hex token、@theme で定義):

src/app/globals.css:
  @import "tailwindcss";
  @theme {
    --color-andes-navy:    #0F1B3D;
    --color-andes-paper:   #FAFAF7;
    --color-andes-ink:     #0A0A0A;
    --color-andes-crimson: #C8102E;
    --color-andes-glow:    #E83E5C;
    --color-andes-subtle:  #4A5066;
    --color-andes-deep:    #060B1F;
    --color-gray-50:       #F5F4F0;
    --color-gray-100:      #E8E6E0;
    --color-gray-300:      #B8B5AC;
    --color-gray-500:      #6E6B65;
    --color-gray-700:      #3D3B36;
    --color-gray-900:      #1A1917;

    --ease-andes: cubic-bezier(0.16, 1, 0.3, 1);
  }
  body { background: var(--color-andes-paper); color: var(--color-andes-ink); }

dark inversion 用 utility (後の Phase 4/5 で使う、いま定義のみ):
  .dark-inversion { background: var(--color-andes-navy); color: var(--color-andes-paper); }

CUSTOM ANIMATIONS (Tailwind config keyframes + animation):

  keyframes: {
    "fade-up": {
      "0%":   { opacity: "0", transform: "translateY(20px)", filter: "blur(4px)" },
      "100%": { opacity: "1", transform: "translateY(0)",    filter: "blur(0)"   },
    },
    "fade-in": {
      "0%":   { opacity: "0" },
      "100%": { opacity: "1" },
    },
    "line-draw": {
      "0%":   { strokeDashoffset: "var(--path-length, 400)" },
      "100%": { strokeDashoffset: "0" },
    },
    "arc-draw": {
      "0%":   { strokeDashoffset: "var(--arc-length, 800)" },
      "100%": { strokeDashoffset: "0" },
    },
  },
  animation: {
    "fade-up":    "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "fade-in":    "fade-in 0.5s ease-out forwards",
    "line-draw":  "line-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards",
    "arc-draw":   "arc-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards",
  },

prefers-reduced-motion 対応 (globals.css):
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

HERO SECTION (light dominant、Top page only):

ファイル: src/components/sections/Hero.tsx (server component、'use client' 不要)
文言は全て messages/{ja,en,pt-BR}.json から useTranslations で引く。ハードコード NG。

structure:
  outer <section>: relative min-h-[80vh] flex items-center bg-andes-paper overflow-hidden pt-24 md:pt-32
  content container: relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16
                      grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center

LEFT column (text + CTA):

  Heading (animation-delay 0.2s、opacity-0 animate-fade-up):
    <h1 className="font-display font-bold text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05]
                   tracking-[-0.03em] text-andes-ink mb-4 md:mb-6 opacity-0 animate-fade-up"
        style={{ animationDelay: "0.2s" }}>
      {t("home.hero.title")}
    </h1>
    実 text: 「Agentic Commerce のための LATAM infrastructure。」

  Subtitle (delay 0.4s):
    <p className="font-body text-[clamp(1.05rem,1.8vw,1.4rem)] leading-relaxed text-gray-700
                  mb-8 md:mb-10 opacity-0 animate-fade-up"
       style={{ animationDelay: "0.4s" }}>
      {t("home.hero.subtitle")}
    </p>
    実 text: 「5 億人の生活基盤を、AI エージェントを中心に再設計する。」

  CTA row (delay 0.6s、flex flex-wrap gap-4 opacity-0 animate-fade-up):
    primary (Link to /businesses):
      bg-andes-navy text-andes-paper px-6 py-3 md:px-8 md:py-4 rounded-md
      text-sm font-medium tracking-wide
      hover:bg-andes-navy/90 active:scale-[0.97] transition-all
      "事業を見る" = t("home.hero.cta_primary")

    secondary (Link to /about, outline):
      border border-andes-ink/20 text-andes-ink px-6 py-3 md:px-8 md:py-4 rounded-md
      text-sm font-medium tracking-wide
      hover:border-andes-crimson hover:text-andes-crimson
      active:scale-[0.97] transition-all
      "Andes について" = t("home.hero.cta_secondary")

RIGHT column (visual、aspect-[4/5] lg:aspect-square relative):

  上 60%: <TwoLayerDiagram /> SVG component
    file: src/components/visuals/TwoLayerDiagram.tsx
    viewBox 480x320, width:100%, height: auto

    box1 (Layer ①): rect 上、stroke="var(--color-andes-ink)" stroke-width 1.5、fill="none"
                    内 text: "Layer ①" (font-body text-xs uppercase tracking-widest text-andes-subtle)
                              "購入エージェント" (font-display text-lg font-medium text-andes-ink)
    arrow ↓ : path、Ink stroke、中央
    box2 (Layer ②): rect 下、同じ stroke
                    内 text: "Layer ②" / "プラットフォーム"

    全 path / rect の stroke に
      stroke-dasharray={pathLength} stroke-dashoffset={pathLength}
      className="animate-line-draw"
      style={{ "--path-length": "400" } as React.CSSProperties}
    で line-draw animation 適用

  下 40%: <JapanBRMap /> SVG component
    file: src/components/visuals/JapanBRMap.tsx
    viewBox 800x320, width:100%, height: auto

    Japan silhouette (左、x=80~200、Ink fill 8% opacity)
    South America silhouette (右、x=500~720、Ink fill 8% opacity)
    Tokyo dot: circle (Crimson fill、r=5)、Japan 中央
    São Paulo dot: circle (Crimson fill、r=5)、South America 右上
    arc path: M tokyo Q peak saoPaulo (curve は上向き、Navy stroke、stroke-width 1.5)
      arc に: stroke-dasharray={arcLength} stroke-dashoffset={arcLength}
      className="animate-arc-draw"
      style={{ "--arc-length": "800" } as React.CSSProperties}

OVERALL animation sequence:
  0.2s   h1 fade-up
  0.4s   subtitle fade-up
  0.5s   2 layer diagram line draw begins
  0.6s   CTA buttons fade-up
  0.7s   map arc draw begins

PAGE WRAPPER:
  src/app/[locale]/page.tsx:
    import { Hero } from "@/components/sections/Hero";
    export default function HomePage() {
      return (
        <main>
          <Hero />
          {/* WhyNow / Portfolio / GroupStructure / FooterCTA は Phase 2 後半 */}
        </main>
      );
    }

KEY DEPENDENCIES (Phase 0/1 で install 済み想定):
  next, react, next-intl, tailwindcss v4, @types/react

IMPORTANT NOTES:
- 全文言は messages/{ja,en,pt-BR}.json から useTranslations で引く (next-intl)
- ハードコード厳禁 (AGENTS.md)
- h1 は 1 page に 1 つ (Top の Hero に置く)
- img タグ NG、必要なら next/image (Hero は SVG なので不要)
- responsive: mobile (< lg) では 1 列 (text 上、visual 下)、lg: で 2 列
- text 色は scroll state に依存しない (Hero は light page 固定)
- Header は別 component (Phase 1 完了済)、scroll swap は Header 側で処理
- prefers-reduced-motion 必達対応 (globals.css の global rule で OK)
- Lighthouse Performance > 90 / Accessibility > 95 を target

ACCEPT (sir 視覚承認):
✓ h1 表示: 「Agentic Commerce のための LATAM infrastructure。」(ja)、
           "Infrastructure for Agentic Commerce in LATAM." (en)、
           "Infraestrutura para o Agentic Commerce na América Latina." (pt-BR)
✓ subtitle に「5 億人」(ja) / "half a billion" (en) / "meio bilhão" (pt-BR)
✓ CTA 2 個、primary 紺 filled、secondary outline
✓ 右側 SVG: 2 layer diagram の box stroke が load 時に line draw (0.5s 後 0.8s で完了)
✓ 右側 SVG: Japan→BR arc が load 時に draw (0.7s 後 1.2s で完了)
✓ 3 言語 switch で全 copy 切替
✓ mobile (375px) で 1 列 stack、visual が text の下
✓ prefers-reduced-motion で全 animation 即時表示
✓ Lighthouse Performance > 90 / Accessibility > 95
✓ sir appshot で視覚承認

Start with src/components/sections/Hero.tsx、その後 visuals/TwoLayerDiagram.tsx と visuals/JapanBRMap.tsx を実装。終わったら preview URL を私（sir）に。
```

---

## sir 操作

```
1. Codex を本 repo (~/Desktop/Andes-Website) で開く
2. 上記「貼り付け本文」を copy
3. Codex の chat or /goal に paste
4. Codex が読み始める、確認したら yes
5. 実装完了で preview を sir に見せる
6. sir 視覚承認 → 次 Phase
   修正必要 → 「ここの spacing 増やして」等 side chat で
```

---

## SENTINEL AI prompt と比較した違い

```
SENTINEL AI                         Andes Hero (本 prompt)
─────────────────────────────       ─────────────────────────
Vite + React + TS                   Next.js 15 + App Router + TS
shadcn/ui Button                    plain <Link> + Tailwind class
Sora 1 font                         Geist + Inter + Noto Sans JP
Dark hero (#0d0d0d BG)              Light hero (#FAFAF7 BG)
Green primary (#1eff34)             Navy primary (#0F1B3D) + Crimson accent
Spline 3D scene 背景                 SVG 2 layer diagram + Japan→BR map
英語 1 言語                          ja / en / pt-BR の 3 言語 (next-intl)
固有 brand: SENTINEL AI              固有 brand: Andes Inc.
pointer-events-none ハック           不要 (3D 重ねないため)
ハードコード文言                      全 i18n key 経由 (AGENTS.md ルール)
```