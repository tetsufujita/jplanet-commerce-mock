# 01-hero — Build Spec（Shopify JP 学習用再現）

> 対象: `data-section-name="hero"`（variant `redesign-2024` / `data-mode="dark"`）
> viewport 1440px（実測キャプチャ 1425×850px）。sticky header（72px・透明）が上に重なる。
> 出典実測: `shots/01-hero.png` / `shopify-jp-dom.html` / `shopify-jp-specs.json` / `shopify-jp-animations.json`

---

## 1. レイアウト構造

```
<section>  relative / overflow-hidden / dark / 高さ ≈850px（固定 height ではなく内容+padding で決まる）
│  bg: poster画像を bg-cover bg-center（動画ロード前のフォールバック）
│  bg色（動画の下地）: section-dark-bg ≈ #0A0A0A【要実測】
│
├─ <video>            absolute inset-0 / size-full / object-cover（1425×851 実測）
├─ ::before           absolute / 下半分(h-1/2) / bottom-0 / z-10
│                     linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.7) 50%)
│                     → 下半分を暗くして白文字を立たせる
├─ container          z-20 / flex flex-col / sm:justify-end / gap-y-lg(≈24px【要実測】)
│  │                  pt: lg=225px（実測クラス lg:pt-[225px]）/ pb: md=3xl(≈64px【要実測】)
│  │                  幅: 中央寄せ、左右 padding ≈72px（screenshot 実測で H1 左端 x≈72px）【要実測: --margin】
│  ├─ H1 ブロック（静的行 + 回転スロット、§2/§4 参照）
│  ├─ <p> 説明文      w-1/3（lg時 ≈430px）/ text-balance
│  └─ CTA 行          flex row / gap-x-sm(≈16px【要実測】)
│
└─ ::after            grid 末尾アイテム / h-3xl(≈64px【要実測】) / mt-auto
                      bg: coal-black ≈ #0A0A0A【要実測】/ rounded-t-5xl(≈40px【要実測】)
                      + shadow-hero-ab-card-edge【要実測】
                      → 次 section (02 a-b) の「カード上端」を hero 最下部に先出しする帯
```

縦位置の実測（viewport top 基準、1440px 時）:

| 要素 | y（概算） |
|---|---|
| H1 1行目「目指せ、次の」 | ≈300px |
| H1 2行目（回転語スロット） | ≈400px |
| 説明文 | ≈510〜585px |
| CTA 行 | ≈675〜725px |
| 黒丸角帯（::after） | ≈786〜850px |

> 観察メモの「下帯に機能リンク」= この黒帯 + 直下 §02 の tab 文言（「お客さまが買い物をする…」）が 850px 境界に接している状態。リンク群自体は **§02 の管轄**。本 section では丸角黒帯のみ再現する。

---

## 2. 要素インベントリ

| 要素 | 実測値 |
|---|---|
| H1（全体） | 96px / weight 400 / line-height 96px / letter-spacing normal / #FFFFFF / "Noto Sans JP", Helvetica, Arial, sans-serif |
| H1 構造 | a11y 用: `<h1 class="sr-only…">目指せ、次の<br>AI のオールスター</h1>`（motion-reduce / JS無効時のみ可視化）。視覚用: `aria-hidden` の 2 行組（行1 静的 div + 行2 絶対配置の回転スロット） |
| 回転スロットの高さ確保 | 不可視の sizer `<h2>`（opacity-0 / 最長語「カテゴリークリエイター」/ mobile min-h-32 / sm:min-h-0 / mb-lg） |
| 説明 `<p>` | text-body-base（≈16px / lh≈1.5【要実測】）/ #FFF / lg:w-1/3 / text-balance |
| CTA① 白 pill（primary） | bg #FFFFFF / 文字 #000000 / radius 9999px / 18px / weight 550 / padding 12px 24px / border 2px（bg と同色）/ hover で bg がややグレーに変化【要実測: hover token】 |
| CTA② outline（video modal） | bg transparent / 文字 #FFF / radius 9999px / 18px / weight 550 / padding 12px 26px 12px 16px / border 2px 白系（≈ rgba(255,255,255,0.4)【要実測】）/ hover:ring-1（外周 1px 追加） |
| CTA② play アイコン | 円: 28px（md）/ border 2px currentColor / rounded-full。内側 play 三角 SVG 幅 12px / stroke 白 |
| PIP ボタン（任意・おまけ） | fixed bottom 80px / right margin / w 190px / video h 107px / rounded 12px / border rgba(255,255,255,.3) / hover で白 glow shadow。ラベル 13px / weight 500 / ls -0.01em / text-shadow 0 2px 6.7px rgba(0,0,0,.4)。出現トリガー【要実測】 |
| mobile 専用 email form | `sm:hidden`。desktop 再現では対象外（spec 記載のみ） |

回転語リスト（DOM 出現順・原文のまま使用）:

1. AI のオールスター（初期表示、「AI」+「のオールスター」の 2 segment に分割済）
2. 誰もが知るブランド
3. 個人起業家
4. カテゴリークリエイター
5. 世界的企業
6. 行列のできるストア
7. 話題のビジネス

---

## 3. テキスト計画

| 元 | 再現で使う文言 | 方針 |
|---|---|---|
| H1「目指せ、次の」+ 回転語 7 種 | 原文のまま | 短い機能的見出し → 原文 OK |
| 説明文「夢は大きく、構築は迅速に。世界最高のコマースプラットフォーム、Shopify で実現しましょう。」 | 「描く理想は大きく、形にするのは素早く。世界中の商いを支えるコマース基盤、Storely がその一歩を後押しします。」 | 同じ長さ・同じ意味合いの新規日本語（逐語コピー禁止）。ブランド名は架空「Storely」に置換 |
| CTA①「無料で始める」 | 原文のまま | 機能ラベル |
| CTA②「Shopifyが開発されるまで」 | 「Storelyが生まれるまで」 | ブランド名置換 |
| video の aria-label | 「商品を販売し、ビジネスを育て、成功を喜ぶ商人たちの映像。」 | paraphrase |

---

## 4. motion 仮説（実測 animations.json + DOM クラスから）

### 4-1. H1 回転語（確定度: 高 — CSSTransition 実測あり）

- 仕組み: **CSS transition + transition-delay で hold を作る**方式。state class を即時に付け替え、`transition-delay: 3s` で 3000ms 待ってから 450ms アニメ。
- duration **450ms** / easing **cubic-bezier(0.5, 0, 0.5, 1)** / hold **3000ms**（= transition-delay）
- segment stagger: 語が複数 segment のとき 2 つ目は delay **+150ms**（3s → 3.15s）
- 各語は `overflow-hidden`（pb-2 -mt-2 でディセンダー余白）の wrapper 内でスライド:
  - 待機: `translateY(100%) opacity-0`（下に隠れる）
  - 表示: `translateY(0) opacity-1`
  - 退場: `translateY(-100%) opacity-0`（上へ抜ける）
  - ※実測 keyframes の computed は ±400px。`translate-y-100` の実体が 100% か固定 400px か【要実測】。再現は ±110% で十分。
- 1 サイクル ≈ 3000 + 450 (+150 stagger) ≈ 3.6s で次の語へ。ループ順は DOM 順と仮定【要実測: 全周ループの順番とサイクル起点（transitionend 連鎖か固定 interval か）】
- reduced-motion: アニメ版は `motion-reduce:hidden`、sr-only の静的 `<h1>` が `motion-reduce:not-sr-only` で可視化 → **必ず再現する**

### 4-2. その他

| 対象 | 仮説 | 根拠 |
|---|---|---|
| 背景動画 | `autoplay loop muted playsinline` + poster。スクロール連動なし | DOM 属性 |
| CTA hover | `transition-all duration-150`。primary は bg トークン切替、secondary は ring-1 追加 | DOM クラス。hover 後の色【要実測】 |
| PIP ボタン | `animate-slide-up-fade-in`（下から fade-in）。hover で下部ラベル opacity-0 → 中央拡大アイコン opacity-100（transition-opacity） | DOM クラス。出現タイミング（ロード直後か scroll 後か）【要実測】 |
| ::after 黒帯 | アニメなし（静的） | クラスに motion なし |
| スクロール連動 | hero 内には **なし**（sticky は header のみ） | DOM に sticky/scroll 系クラスなし |

---

## 5. アセット置換計画（本家 CDN の DL / 複製は禁止）

| 元アセット | 置換 |
|---|---|
| 背景動画（blob、1425×851、autoplay loop muted） | **(c) 生成動画**: まず (b) AI 生成画像で 1920×1080 の静止画（暖色の室内で歓喜する若い商人、手前に商品箱、シネマティック・dark grade）を作り、Higgsfield image→video（5s ループ、緩い手持ち感・人物の小さな動き）で動画化。`<video autoplay muted loop playsinline poster>` + reduced-motion 時は poster 静止画 |
| poster PNG（1920×1080） | 上記生成静止画をそのまま poster / bg-image に流用 |
| PIP サムネ動画 | 背景動画と同一ソースを再利用（本家も同一 blob） |
| play 三角 SVG | **(a) CSS/SVG モック**: 20×20 viewBox の path を自作（角丸三角） |
| ブランド名 Shopify | 架空「Storely」に置換（ロゴ不要。本 section にロゴ画像は出ない） |

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/
├── HeroSection.tsx        named export: HeroSection（section 全体 / 背景 video / 勾配 / 黒帯）
├── RotatingHeadline.tsx   named export: RotatingHeadline（sr-only h1 + 回転スロット）
└── HeroCtas.tsx           named export: HeroCtas（白 pill + outline play）
```

- **RotatingHeadline**
  - state: `const [index, setIndex] = useState(0)`（表示中の語）
  - effect: `useEffect` で `setInterval(≈3600ms)`（または motion の onAnimationComplete 連鎖）で index++ % 7
  - motion/react: 各 segment を `motion.span`、`AnimatePresence` で enter/exit。
    `transition={{ duration: 0.45, ease: [0.5, 0, 0.5, 1], delay: 3 + i * 0.15 }}`
    variants: enter `{ y: "110%", opacity: 0 }→{ y: 0, opacity: 1 }` / exit `{ y: "-110%", opacity: 0 }`
  - `useReducedMotion()` true なら回転を止め静的 h1 のみ表示
  - 高さ確保: 最長語の不可視 sizer（`aria-hidden` + `invisible`）を本家同様に置く
- **HeroSection**
  - state 不要。`<video>` は ref 不要（属性 autoplay のみ）。reduced-motion 時は `<img>`（poster）に差し替え → `useReducedMotion()` 1 つだけ使用
  - 勾配 / 黒帯は Tailwind の `before:` / `after:` で本家どおり擬似要素実装
- **HeroCtas**: 完全 static、state/effect なし
- PIP ボタンは scope 外（やる場合は `HeroPipButton.tsx` を別途、IntersectionObserver で出現制御【要実測】）
- 色・spacing は `@theme` トークン化（`--color-section-dark-bg` 等）。ハードコード hex 禁止（AGENTS.md 準拠）

### 要実測リスト（build 後に本家と diff で確認）

1. spacing トークン実値（sm / lg / xl / 2xl / 3xl / 4xl、特に pb-3xl と gap-y-lg）
2. container の max-width と `--margin`（左端 ≈72px の内訳）
3. `text-body-base` の font-size / line-height
4. button トークンの hover / focus / active 色（primary bg-hover、secondary border 色）
5. `coal-black` / `section-dark-bg` の正確な hex
6. 回転ループの全周順序とサイクル駆動方式（transitionend 連鎖 or interval）
7. `translate-y-100` の実体（100% か 400px 固定か）
8. `rounded-t-5xl` の radius 実値
9. `shadow-hero-ab-card-edge` の値
10. PIP ボタンの出現トリガーとタイミング
