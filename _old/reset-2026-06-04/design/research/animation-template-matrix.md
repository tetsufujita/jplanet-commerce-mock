---
title: Animation Template Matrix — Andes 投資家サイト
updated: 2026-06-04
status: research（fetch 実在確認・ライセンス検証済）
scope: 5 カテゴリ × motion grammar 抽出（テンプレ流用でなく転用パターン）
---

# Animation Template Matrix

> Andes 投資家サイト用。テンプレをそのまま使わず、**転用できる motion grammar と実装パターン**を抽出。
> 全候補 GitHub/npm/bundlephobia で fetch 確認。visual quality は 1-5、license/perf risk は 低/中/高。
> 評価レンズ: 日本⇄ブラジル × エージェンティックコマース / ダーク宇宙 / 色2つ（近黒+Crimson #C8102E pin-point）/ restrained premium / generic SaaS NG / mobile 軽量 / reduced-motion fallback。

## 0. ヘッドライン決定

| 決定 | 採用 | 理由 |
|---|---|---|
| Hero の地球 | **cobe**（5KB・MIT・無依存） | 闇の地球+2光点+glow が specs 通り。Stripe globe の実装元。mobile 最軽 |
| corridor の弧 | **three-globe**（MIT・増分151KB、three 共有） | great-circle arc が一本→無数、`arcDashAnimateTime` で流れる |
| scroll 土台 | **Lenis + GSAP ScrollTrigger + @gsap/react**（既導入・無償） | de-facto。pin/scrub/snap、matchMedia で reduced-motion |
| 宇宙背景 | **drei `<Stars>` + `<Sparkles>`**（既導入・MIT） | 軽量 shader 点群。Crimson sparkle を pin-point |
| 大気/霧 | **@shadergradient/react**（MIT・Next15/R3F9/React19 公式） | 2色 gradient をゆっくり漂わせ深淵感 |
| 数字 | **@number-flow/react**（推奨）/ react-countup（代替） | 4 マクロ数字。前者は React19 明示 |
| 動く図解 | **Rive**（MIT runtime）or SVG+GSAP / @xyflow/react（重カスタム） | Platform architecture の 2 層を「動く図」に |
| 文字 | **GSAP SplitText**（無償化） | 宣言コピーの mask reveal |
| ❌不採用 | react-globe.gl / Spline / vanta / whatamesh / Remotion runtime | three 二重化 / 透かし課金 / 停滞 / LICENSE無 / 会社規模で有償 |

---

## 1. Scroll-driven website animation

| name | URL | motion pattern | vq | 難度 | license | perf | 使える | 避ける |
|---|---|---|---|---|---|---|---|---|
| GSAP ScrollTrigger | gsap.com/docs/v3/Plugins/ScrollTrigger/ | pin/scrub/snap/horizontal/matchMedia | 5 | 低中 | 無(2025無料化) | 低 | 全 section の土台。reduced-motion 分岐 | plugin 乱用＝動きすぎ |
| Lenis | github.com/darkroomengineering/lenis | smooth scroll 同期基盤 | 5 | 低 | 無(MIT) | 低 | ScrollTrigger と同期、慣性スクロール | smoothTouch 強すぎ＝酔い |
| Codrops Cinematic 3D Scroll (R3F) | tympanus.net/codrops/2025/11/19/...cinematic-3d-scroll... | scroll→camera path/shader | 5 | 高 | MIT | 中高 | `#0a0a0a`+fog+light のダーク宇宙そのもの | フル3Dは重い→Hero限定 |
| Codrops Layered Zoom (Telescope) | tympanus.net/codrops/2025/10/29/...layered-zoom-scroll... | masked 画像 trailing zoom + blur | 5 | 中高 | 要確認(repo) | 中 | Hero の望遠鏡的奥行きズーム導入 | 6層 blur は mobile 間引き必須 |
| Codrops SVG Mask Transitions | tympanus.net/codrops/2026/03/11/svg-mask-transitions... | 全画面 image reveal（mask 4種） | 4 | 中 | 要確認(repo) | 中 | 章転換の幕開け（1パターンだけ） | 4種同時＝派手 generic |
| Codrops On-Scroll Layout Formations | tympanus.net/codrops/2024/09/18/...layout-formations/ | pin で grid が組み上がる | 4 | 中 | MIT(Codrops) | 中 | Platform を「部品→インフラ」で組み上げ | 装飾過多 grid |
| Codrops Consecutive Scroll (1 elem) | tympanus.net/codrops/2024/11/20/consecutive-scroll... | GSAP Flip、1要素が waypoint 移動 | 4 | 中 | MIT | 低中 | 1パケットが日→伯を通過する narrative | 要素過多で意図ぼやけ |
| drei ScrollControls/useScroll | drei.docs.pmnd.rs/controls/scroll-controls | offset(0-1)→3D bind | 4 | 中 | 無(MIT,既導入) | 中 | 既導入だけで scroll→3D camera | DOM と二重スクロール管理 |

> Codrops 本体 demo は MIT（[licensing](https://tympanus.net/codrops/licensing/) 確認）。外部コントリビュータ repo は LICENSE を 1 件ずつ要確認（実装前）。

## 2. Remotion / video-style narrative — ⚠ライセンス注意

| name | URL | motion pattern | vq | 難度 | license | perf | 使える | 避ける |
|---|---|---|---|---|---|---|---|---|
| @remotion/shapes | remotion.dev/docs/shapes | SVG 図形 path 生成 | 3 | 低 | **無(MIT)** | 低 | architecture 図の幾何ノード/Crimson 図形 | 装飾多用 |
| @remotion/noise | remotion.dev/docs/noise | Perlin/simplex noise 値 | 4 | 低 | **無(MIT)** | 低 | 星雲/粒子の有機ゆらぎ（three/gsap に食わせる） | 全面ノイズで騒がしく |
| @remotion/player（hero embed） | remotion.dev/docs/player | React composition を scroll-seek | 4 | 中 | **高(4名以上=$100/mo〜)** | 中 | scroll-scrub で corridor を精密制御 | 会社規模で有償・runtime 重 |
| ビルド時 mp4 書き出し(SSR) | remotion.dev/docs/ssr | CI で mp4 を焼き `<video>` 配信 | 4 | 高 | **高(Automators)** | 低 | hero を高品質 mp4 で軽量配信 | render も有償トリガー |
| @remotion/transitions | remotion.dev/docs/transitions | fade/wipe/dreamy-zoom 等 | 4 | 低中 | **高(UNLICENSED=会社License)** | 低中 | 章送り遷移 | MIT でない・generic wipe |

**Remotion 所感**: Andes は 4 名以上＝**Free License 対象外**。core/player/transitions/renderer は全て Company License（Player の動的 embed は Automators $100/mo〜）。**サイト runtime には使わない。** 使うなら ①MIT の `shapes`/`noise` だけ取り込む（既導入 three/gsap に食わせる）か、②どうしても動画なら mp4 を焼いて Automators で正式契約。採用前に hi@remotion.dev 確認推奨。

## 3. Data / Map / Network — ★corridor の中核

| name | URL | motion pattern | vq | 難度 | license | perf(mobile) | 使える | 避ける |
|---|---|---|---|---|---|---|---|---|
| **cobe** | github.com/shuding/cobe | dotted globe + arc + marker、phi 回転 | 4.5 | 低中 | 無(MIT,zero-dep) | **極低(5.8KB)** | 闇の地球+2光点、scroll で phi、色2つに直 map。Hero 本命 | dotted を tech-demo 風にしすぎない |
| **three-globe** | github.com/vasturiano/three-globe | great-circle arc + `arcDashAnimateTime` で流れる | 5 | 中 | 無(MIT) | 中(151KB増分,three共有) | **弧が一本→無数に増殖**、arcColor gradient。corridor 本命 | default texture は generic→自作必須 |
| react-globe.gl | github.com/vasturiano/react-globe.gl | three-globe を React wrap | 5 | 低 | 無(MIT) | **高(~497KB,three内包)** | prototype 高速 | **three 二重化→不採用** |
| d3-geo + canvas | github.com/d3/d3-geo | geoInterpolate で great-circle、2D | 3.5 | 中 | 無(ISC) | **低(2D canvas)** | **reduced-motion/mobile fallback の本命** | 立体感なし→hero 主役不可 |
| react-countup | github.com/glennreyes/react-countup | 数字カウントアップ | 4 | 低 | 無(MIT) | 極低(4.3KB) | 4 マクロ数字、IntersectionObserver trigger | 停滞気味→@number-flow/react 優先可 |
| @xyflow/react v12 | github.com/xyflow/xyflow | node graph + animated edge | 4 | 中 | 無(MIT) | 中 | Platform の 2 層/agent workflow 図 | editor 風 generic→重カスタム必須 |
| d3-sankey | github.com/d3/d3-sankey | flow 帯で量を表現 | 3.5 | 中 | 無(BSD-3) | 低 | 日→伯の物量フロー | 会計 SaaS 感、globe arc に劣る |

## 4. WebGL / shader / 3D background

| name | URL | motion pattern | vq | 難度 | license | perf(mobile) | 使える | 避ける |
|---|---|---|---|---|---|---|---|---|
| drei `<Stars>` | drei.docs.pmnd.rs/staging/stars | shader 点群の瞬き星野 | 4 | 低(既導入) | 無(MIT) | 低 | 宇宙の星野。saturation=0 で白星 | count 過多→mobile 削る |
| drei `<Sparkles>` | drei.docs.pmnd.rs(staging) | 浮遊発光粒子、color 指定可 | 4 | 低(既導入) | 無(MIT) | 低 | **Crimson pin-point 粒子**を少数 | 大量＝generic キラキラ |
| @shadergradient/react | github.com/ruucm/shadergradient | 流れる 3D mesh gradient | 4 | 低 | 無(MIT,React19公式) | 中(DPR clamp) | 2色の漂う大気を Hero/CTA 背景 | 色数増＝generic、速いと安い |
| drei `<MeshDistortMaterial>` | drei.docs(既導入) | 歪む sphere 表面 | 3 | 低 | 無(MIT) | 低 | 闇の地球を sphere+distort+fresnel Crimson | generic blob 化注意 |
| drei `<Cloud>`/`<Clouds>` | drei.docs.pmnd.rs/staging/cloud | volumetric 風 霧/雲 | 4 | 中 | 無(MIT) | 中高 | 大気/霧の奥行き | mobile 枚数過多で致命的 |
| react-fluid-distortion | github.com/whatisjery/react-fluid-distortion | cursor 反応の流体歪み | 4 | 中 | 無(MIT) | **高** | desktop Hero の触れる深淵 | **mobile/RM は off 必須** |
| tsParticles(@tsparticles/react) | github.com/tsparticles/tsparticles | 2D canvas 粒子+links | 3 | 低 | 無(MIT) | 低 | mobile fallback の軽量 star field | WebGL の深みなし→主役 generic |
| Spline(@splinetool/react-spline) | github.com/splinetool/react-spline | no-code 3D 埋め込み | 5 | 低 | **要注意(透かし課金)** | 中高 | GUI で作り込み | **見送り**（透かし$/bundle重） |

## 5. UI motion libraries

| name | URL | motion pattern | vq | 難度 | license | perf(gzip) | 使える | 避ける |
|---|---|---|---|---|---|---|---|---|
| Motion(framer-motion) | npmjs.com/package/motion | 宣言的 reveal/stagger/scroll | 4 | 低 | 無(MIT,既導入) | 中(42.8KB) | section reveal、`useReducedMotion` 内蔵 | 多用＝generic |
| GSAP + @gsap/react | gsap.com | timeline/ScrollTrigger/SplitText/MorphSVG | 5 | 中 | 無(2025無料化) | 低(26.6KB) | corridor 軌道、複雑 timeline、文字分解 | （Webflow 競合ツール用途のみ禁止） |
| @rive-app/react-canvas | npmjs.com/@rive-app/react-canvas | state machine 駆動の動く図 | 5 | 中 | 無(MIT runtime) | 中(46.4KB) | **インタラクティブ infra 図解** | editor 制作工数 |
| @lottiefiles/dotlottie-react | npmjs.com/@lottiefiles/dotlottie-react | 圧縮 .lottie 再生 | 4 | 低 | 無(MIT) | 中(35.4KB) | explainer/アイコン（Lottie 使うなら一択） | WASM 初期化、mobile fallback |
| Magic UI | magicui.design | animated beam/particles | 3 | 低 | 無(MIT) | 中 | beam を改変素材化（依存=motion） | default は generic→要作り替え |
| React Bits | reactbits.dev | text/background 130+ | 3 | 低 | 中(MIT+Commons Clause) | 低中 | text animation 素材（自社利用OK） | 再販禁止・generic 背景避ける |
| Aceternity UI | ui.aceternity.com | beam/aurora/sparkles | 3 | 低 | 中(Terms 制限・premium有料) | 中 | beam の概念だけ転用 | **強い generic 感**・そのまま NG |
| split-type | npmjs.com/package/split-type | テキスト分割 | n/a | 低 | 無(ISC,既導入) | 低 | 文字 reveal 下地 | 停滞→GSAP SplitText 移行検討 |

**Lottie vs Rive**: explainer/動く図は **Rive 推奨**（state machine でホバー/スクロール反応＝「生きてる infra」）。Lottie 使うなら dotLottie 一択。**両方は入れない**。コピペ系(Aceternity/Magic UI/React Bits)は**そのまま採用 NG**、ソースを吸収して色(近黒+Crimson)・密度・速度を Andes トークンに作り替える前提。安全度 Magic UI(MIT) > React Bits(MIT+CC) > Aceternity(Terms制限)。

---

## ❌ 明示除外（見た目が良くても使わない）
- **react-globe.gl / globe.gl** — three 内包で二重化（three-globe 直叩きで代替）
- **Spline** — web export 透かし課金（Starter $12/Pro $20）+ bundle 重 + wrapper 停滞
- **vanta.js** — 2022 停滞・React19 未検証・generic
- **whatamesh** — LICENSE 無し（Stripe 由来）
- **Remotion core/player/transitions/renderer** — 4 名以上は有償（runtime 採用しない。shapes/noise=MIT のみ可）
- **Aceternity をそのまま** — generic SaaS の典型・Terms 制限

## 横断ルール
- 全 WebGL 層は MotionGate（既存 prefers-reduced-motion context）配下。RM で静止フレーム。
- mobile: DPR clamp(1〜1.5) + count 削減 + fluid/cursor 系 off。**R3F canvas を複数並走させない**（mobile 致命的）。
- 色は 2 つ厳守（近黒 + Crimson #C8102E pin-point）。
- GSAP/Lenis は商用無償（GSAP は 2025 Webflow 買収で全 plugin 解放）。

## 出典
5 カテゴリ並列リサーチ 2026-06-04（GitHub/npm/bundlephobia fetch 実在確認）。詳細 URL は各カテゴリの調査ログ。関連: docs/09（確定スタック）/ docs/11（参考サイト）/ docs/12（site vision）。
