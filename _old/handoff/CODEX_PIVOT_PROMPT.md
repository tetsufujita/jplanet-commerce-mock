# Codex pivot prompt — storytelling cinematic への完全方向転換

> sir 判断（2026-05-22）で、Stripe / Shopify clean infra 路線は **完全棄却**。
> Andes Top page を **storytelling cinematic site**（Three.js + GSAP + Lenis）に再構築する。
> 現在の Phase 2 までの実装（Hero / 静的 2 layer diagram / Stripe 風 layout）は **破棄前提**。
> 本 file の「貼り付け本文」を Codex に渡す。

---

## 貼り付け本文（Codex に渡す）

```
STOP — Andes corporate site の方向が完全に変わった（sir-decided 2026-05-22）。

これまでの Stripe / Shopify clean infra 路線は棄却。新方向は storytelling cinematic site
（Apple Vision Pro / Active Theory / Locomotive 級）。Top page を 7 章 cinematic journey
として再構築する。Phase 0 (scaffold) は活かす。Phase 2 で組んだ Stripe 風 Hero / 静的
diagram / clean layout は破棄して書き直す。

実装前に必ず以下を読み直す:

1. design/storytelling-references.md     7 章設計の詳細、Apple Vision Pro / Sidewave /
                                          Locomotive の DNA 抽出、章ごと演出仕様
2. design/storytelling-stack-recipes.md   Lenis / GSAP / R3F の Next.js 15 互換 recipe、
                                          install / 最小 snippet / 5 gotcha × 4 領域
3. messages/{ja,en,pt-BR}.json            新 hero copy（home.hero.line1 / line2 / line3）

---

STACK 追加（pnpm add）:

  pnpm add lenis gsap @gsap/react split-type three @react-three/fiber @react-three/drei
  pnpm add -D @types/three

next.config.ts:
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei']

initial JS +60-70 kb（dynamic import 後）想定。

---

ARCHITECTURE:

- cinematic experience は全 'use client' に隔離
- 文言は server で getTranslations → props 注入で hydration mismatch 回避
- Lenis SmoothScrollProvider を root に 1 個
- R3F Canvas は page に 1 個のみ（fixed inset-0 z-[-1]）
- Lenis ↔ GSAP ScrollTrigger 双方向同期（lenis.on('scroll', ScrollTrigger.update)
  + gsap.ticker.add の両方）必須、無いと scrub が gummy になる
- mobile では Lenis syncTouch: false で OS scroll に委譲
- prefers-reduced-motion で全 motion 即時無効化、screen reader 用 fallback content 必須

---

HERO COPY（lock、絶対変更不可）:

3 行構成、cinematic に 1 句ずつ画面に出す。文言は messages/{locale}.json から useTranslations
で引く（ハードコード厳禁、AGENTS.md ルール）。

  i18n key                  ja                             en
  ──────────────────────────────────────────────────────────────────────────────
  home.hero.line1           AI が売り、AI が買う。            AI sells. AI buys.
  home.hero.line2           その下に、Andes がある。          Andes is what's underneath.
  home.hero.line3           ─ 中南米 5 億人の生活基盤を、     — Building the infrastructure
                            いま建てる。                    of half a billion lives in LATAM.
  home.hero.cta_primary     事業を見る                       See our work
  home.hero.cta_secondary   Andes について                  About Andes

pt-BR も既に messages/pt-BR.json に完備済み。

---

TOP PAGE = 7 章 CINEMATIC JOURNEY（合計 ~17.5 viewport scroll）:

Chapter 1 — Overture（序曲）            約 3 viewport
─────────────────────────────────────────────────────
  background  深夜青 #060B1F → 黎明オレンジ #FF8A3C へ fluid blend（scroll で）
  visual      全画面 WebGL paint texture（@react-three/fiber + GLSL shader）
              cursor 位置を uniform に渡し paint stroke が反応
              `dpr={[1, 1.5]}` で iPhone Pro GPU 焼け防止
  text        hero 3 行を 1 行ずつ split-type で文字単位 reveal
              line1 (delay 0.3s) → line2 (delay 1.2s) → line3 (delay 2.1s)
              line ごとに scroll で fade-up + blur(4px → 0) + scale(0.96 → 1)
  CTA         primary + secondary 2 個、line3 の後に fade-up（delay 3.0s）
  scroll      Lenis easing、scroll-jacking しない、natural feel

Chapter 2 — Why now                      約 2.5 viewport
─────────────────────────────────────────────────────
  background  sepia #C9A876 → khaki #A89567 のグラデ
  visual      mp4 background video（mute、loop、5 sec）、scroll-pin で sticky
              Apple Vision Pro 風 frame-by-frame playback（currentTime を scroll で制御）
  text        "Why now" の H2、subtitle "2026 年、Agentic Commerce が global で
              立ち上がる。LATAM は独自進化が必要な唯一の経済圏。" を text mask reveal
  paint       OFF（具体章のため）

Chapter 3 — 2 Layer                      約 2 viewport
─────────────────────────────────────────────────────
  background  deep green #1A3D2E → muted moss #4A6655
  visual      Layer ① / Layer ② を SVG で順番に組み上げ（line draw）
              GSAP timeline で box → arrow → box の順に描画、scrub on scroll
  text        "Agentic Commerce の 2 層構造" / Layer ① 購入エージェント /
              Layer ② プラットフォーム
  paint       OFF
  ※ 旧 Stripe 風 2 層 diagram component は ここに移植・拡張（破棄しない）

Chapter 4 — Three Businesses              約 4.5 viewport
─────────────────────────────────────────────────────
  layout      縦 stack、各事業を sticky pin で順番に表示（horizontal NG）
              sub-chapter 4a: J-Planet      vivid red #C8102E hue accent、約 1.5 viewport
              sub-chapter 4b: J-Vita        warm coral #FF6B6B hue accent、約 1.5 viewport
              sub-chapter 4c: Protocol      deep navy #0F1B3D hue accent、約 1.5 viewport
  visual      各 sub-chapter で
                - 大きな event tag（Layer ① / Layer ② endgame）
                - title big type
                - body paragraph
                - 製品写真 or SVG visual（J-Planet は WhatsApp UI mock、
                  J-Vita は薬瓶 / 健康 motif、Protocol は network 概念図）
                - CTA link
  scroll      各 sub-chapter sticky で 1.5 viewport pin、次に進む
  paint       OFF

Chapter 5 — Phase Roadmap                 約 2 viewport
─────────────────────────────────────────────────────
  background  夕焼けグラデ orange #FF6B35 → purple #6B4F8F → indigo #1F2A6B
              （scroll で連続 blend）
  visual      timeline path を SVG で left-to-right draw（scroll-scrubbed）
              Phase 1 (2026) → Phase 2 (2027) → Phase 3 (2028) →
              Phase 4 (2029-30) → endgame (2028+ LATAM AC Protocol)
              各 node で title + year + 1 文
  paint       OFF

Chapter 6 — Protocol Endgame               約 2 viewport
─────────────────────────────────────────────────────
  background  漆黒 #000000 + neon teal #14F195 accent
  visual      全画面 WebGL network graph（@react-three/fiber）
              巨人（OpenAI / Google / Anthropic）の node が Andes node に矢印
              "巨人が Andes を呼ぶ" position を可視化
              cursor 反応で graph が呼吸（subtle pulse）
  text        "LATAM AC Protocol" / "2028 年、共通インフラを OSS として発行" /
              "巨人が Andes を呼ぶ position へ"
  paint       全画面 WebGL（Ch.1 と同じく abstract 章のため）

Chapter 7 — Group + CTA                    約 1.5 viewport
─────────────────────────────────────────────────────
  background  朝の白 #FAFAF7（cinematic 後の "目覚め" 感）
  visual      静止、minimal、装飾なし
  text        「グループ構造」: Andes Inc. (JP) → Andes BR → J-Planet → J-Vita
              「対話を始める」: 投資家 / 採用 / プレス / パートナー
  CTA         primary 紺 #0F1B3D filled「お問い合わせ」→ /contact
  paint       OFF
  ※ minimal で締める、cinematic 後の余韻

---

COLOR TRANSITION 実装:

各 chapter 間で body background を GSAP で連続 blend する:

  ScrollTrigger.create({
    trigger: chapterEl,
    start: "top center",
    end: "bottom center",
    onUpdate: (self) => {
      gsap.to(document.body, {
        backgroundColor: lerpColor(fromColor, toColor, self.progress),
        duration: 0.3,
        overwrite: true,
      });
    },
  });

chunky な切替ではなく **fluid blend** が必須。途中色も自然に補間。

---

ANIMATION 全般 RULE:

- 全 GSAP animation は ScrollTrigger に紐付け（scroll に応じて scrub）
- duration は感じない、scroll 位置で完全制御
- easing: power2.out or cubic-bezier(0.16, 1, 0.3, 1)
- text reveal は split-type（letter split）+ stagger 0.02-0.05s
- 段階 reveal を組み合わせて cinematic depth を出す
- BGM 禁止、video は全 mute
- prefers-reduced-motion: 全 animation 即時完成形に飛ばす、
  scroll-trigger ScrollTrigger.normalizeScroll(false) でも fallback

---

ACCEPT criteria（sir 視覚承認）:

✓ Chapter 1 で hero 3 行が 1 句ずつ split-letter reveal、深夜青→朝オレンジへ blend
✓ Chapter 1 と 6 で全画面 WebGL paint / network が cursor に反応
✓ Chapter 2 で video sticky pin、frame-by-frame scroll 制御
✓ Chapter 3 で 2 層 SVG が scroll-scrub で組み上がる
✓ Chapter 4 で 3 事業が縦 sticky pin（horizontal NG）、各々色 hue 変化
✓ Chapter 5 で timeline path が scroll で left-to-right draw
✓ Chapter 7 で朝の白に切り替わり、CTA で /contact へ
✓ 全章で background color が fluid blend、chunky な切替なし
✓ mobile (375px) で WebGL が degrade（still image or 軽量 fallback）、scroll が滑らか
✓ prefers-reduced-motion で全 motion 即時完成、cinematic effect なし
✓ Lighthouse Performance > 75（cinematic site 基準）、Accessibility > 95
✓ sir appshot 視覚承認

---

DON'T（明示禁止）:

- Stripe / Shopify clean infra 路線へ戻す（aesthetic NG）
- 静的 hero + 静的 2 layer diagram + Stripe 風 stats（旧実装の保持 NG）
- BGM / 音 / 自動再生 audio
- horizontal scroll for Ch.4（sir-decided 縦 stack）
- 5 億人以外の数値を hero に出す（1,700 SKU / 24 ヶ月 / 3 言語 等は NG）
- 「北極星」を外部 copy に出す
- ハードコード文言（必ず messages/{locale}.json から）
- pages/ router、default export、any、console.log
- prefers-reduced-motion 無視
- Canvas を page に複数置く（1 個固定）
- Lenis を ScrollTrigger と同期しない（gummy scrub になる）

---

開始順:

1. pnpm add で stack 追加
2. SmoothScrollProvider（Lenis）を src/app/[locale]/layout.tsx に挿入
3. Chapter 1 から実装（Overture、hero copy split reveal + WebGL paint）
4. sir に preview を見せる → 視覚承認 → Chapter 2 へ
5. 以下、章ごとに sir 承認 loop

旧 src/components/sections/Hero.tsx 等は破棄して書き直す。
新規 file は src/components/chapters/Chapter1Overture.tsx 等の命名で。

Start with Chapter 1 (Overture) only. preview URL を私（sir）に出す。
```

---

## sir 操作

```
1. Codex に上記「貼り付け本文」を paste
2. Codex が install から走り出す
3. Chapter 1 だけ完成したら preview を見て sir 承認
4. 承認 → Chapter 2 へ進む
5. 全 7 章 完成 → 他 page (About / Businesses / Careers / Press / Contact) は
   別 Phase で同じ cinematic philosophy で update
```

---

## SSOT 更新（後追い、Codex が走っている間 Claude が並行）

- docs/04_brand.md → v3（storytelling cinematic SSOT）
- docs/05_pages-spec.md → v3（Top = 7 章 journey、他 page は別途）
- design/wireframes.md → v3（章 storyboard）
- docs/07_codex-handoff.md → v2（旧 Phase 設計を deprecation、新 7 章設計に置換）
