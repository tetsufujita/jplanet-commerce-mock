---
title: Motion Shortlist — Andes が採用すべき motion pattern 10
updated: 2026-06-04
status: research 結論（採用候補の優先順）
---

# Motion Shortlist — 採用すべき 10 パターン

> Andes 投資家サイトに採用する motion pattern を 10 個に絞り、優先度・参考 URL・実装候補 library を確定。
> 優先度: **P0=骨格（これが無いと vision が立たない）/ P1=核の演出 / P2=磨き**。
> 全て 色2つ（近黒+Crimson #C8102E pin-point）/ reduced-motion fallback / mobile 配慮 前提。

## P0 — 骨格

### 1. 闇の地球の自転 + 日本・ブラジル 2 光点（Hero 主役）
- pattern: WebGL globe が宇宙にゆっくり自転、日本と São Paulo に Crimson の marker と glow。
- 参考: https://cobe.vercel.app/ ・ https://stripe.com（globe は cobe 実装元）
- 実装候補: **cobe**（5KB・MIT・無依存）。`baseColor`=近黒 / `glowColor`/`markerColor`=Crimson。
- fallback: reduced-motion で自転停止＋静止 globe。mobile は devicePixelRatio clamp。

### 2. great-circle の弧が一本→無数に増殖（Japan-Brazil corridor）
- pattern: 日→伯に光の弧が 1 本架かり、scroll で 2→10→数百本に増殖、dash が弧上を流れる＝エージェンティックコマースのフロー。
- 参考: https://github.com/vasturiano/three-globe （Arcs Layer / `arcDashAnimateTime`）
- 実装候補: **three-globe**（MIT・既存 three 共有で増分151KB）。`arcColor`=近黒→Crimson gradient。
- fallback: WebGL 不可/RM 時は **d3-geo `geoInterpolate` の静的 SVG arc**（2D・ISC・軽量）。

### 3. 宇宙→南米へスクロール降下（カメラ＝スクロール）
- pattern: スクロールがカメラ移動。宇宙の俯瞰から地球へ、南米へズーム。pin + scrub で各章を制御。
- 参考: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ ・ https://lenis.darkroom.engineering
- 実装候補: **Lenis + GSAP ScrollTrigger + @gsap/react**（全て既導入・無償）。`matchMedia` で reduced-motion/mobile 分岐。

### 4. 宣言コピーの行マスク reveal（Hero 文字）
- pattern: 「中南米に、新しい経済の基盤を建てる。」が行ごとに下から立ち上がる mask reveal（控えめ char stagger）。
- 参考: https://gsap.com/docs/v3/Plugins/SplitText/
- 実装候補: **GSAP SplitText**（2025 無料化）。代替 split-type×framer-motion（既導入・MIT）。

## P1 — 核の演出

### 5. 星野 + Crimson pin-point sparkle（Hero 背景土台）
- pattern: 闇の宇宙に白い星野、ごく少数の Crimson 粒子が漂う。
- 参考: https://drei.docs.pmnd.rs/staging/stars
- 実装候補: **drei `<Stars saturation={0}>` + `<Sparkles color="#C8102E">`**（既導入・MIT）。mobile は count 削減、RM で speed=0。

### 6. 4 マクロ数字の counter-up（Market problem）
- pattern: 画面内に入ると 6.6億 / US$7,690億 / 2.1億 / 1.7億 が桁を回してカウントアップ、極短ラベル付き。
- 参考: https://number-flow.barvian.me ／ https://github.com/glennreyes/react-countup
- 実装候補: **@number-flow/react**（MIT・React19 明示・Intl 桁区切り内蔵）。代替 react-countup（4.3KB）。IntersectionObserver で trigger。

### 7. 2 色の大気 gradient が漂う（Hero / Closing CTA 背景）
- pattern: 近黒→Crimson 極小領域の mesh gradient が低速で流れ、深淵の大気感。
- 参考: https://www.shadergradient.co
- 実装候補: **@shadergradient/react**（MIT・Next15/R3F9/React19 公式）。色は 2 つ厳守、speed 低、DPR clamp。代替: drei `shaderMaterial` 自作。

### 8. 2 層構造の「動く図」（Platform architecture）
- pattern: ①購入エージェント（表層）/ ②プラットフォーム（深層）の 2 層を、ノード+流れるエッジで。hover/scroll で layer 展開。
- 参考: https://rive.app ／ https://reactflow.dev/examples/edges/animating-edges
- 実装候補: **Rive**（MIT runtime・state machine＝インタラクティブ）が第一。重カスタムを避けるなら **SVG + GSAP** 手描き、構造化が要れば **@xyflow/react v12**（generic 回避の重テーマ必須）。

## P2 — 磨き

### 9. 章転換の全画面マスク reveal（section 切替）
- pattern: 章が変わる瞬間、SVG mask / clip-path で全画面が 1 パターンだけ切り替わる（幕開け）。
- 参考: https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/
- 実装候補: **GSAP ScrollTrigger + SVG mask**（既導入）。1 パターンに限定（4 種同時は generic）。

### 10. 部品が pin されてインフラに組み上がる（Platform architecture 導入）
- pattern: section を pin し、部品（物流/税/法/通関）が順に集まって 1 つのインフラ図に組み上がる。
- 参考: https://tympanus.net/codrops/2024/09/18/exploration-of-on-scroll-layout-formations/
- 実装候補: **GSAP ScrollTrigger pin + Flip**（既導入）。

---

## 補欠（採用検討・状況次第）
- **MotionPath で 1 パケットが日→伯を通過**（GSAP MotionPathPlugin・無償）— corridor の別案。
- **react-fluid-distortion** で desktop Hero に cursor 反応の深淵 — mobile/RM 必ず off。
- **dotLottie 単一アクセント** — explainer アイコンが要る時だけ（Rive と役割重複、両方は入れない）。

## 優先度サマリ
```
P0(骨格)  : 1 globe / 2 arc増殖 / 3 scroll降下 / 4 文字reveal
P1(核)    : 5 星野+sparkle / 6 数字 / 7 大気gradient / 8 動く図
P2(磨き)  : 9 章転換mask / 10 pin組み上げ
新規依存  : cobe, three-globe, @shadergradient/react, @number-flow/react, (Rive)  ※他は既導入
```

## 出典
リサーチ 2026-06-04（fetch 実在確認）。詳細マトリクス: design/research/animation-template-matrix.md。section 別: design/research/animation-stack-recommendation.md。
