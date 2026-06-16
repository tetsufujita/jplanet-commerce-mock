# 12-speed — 「圧倒的な安定性。驚異的なスピード。」build spec

> 学習用再現。本家 = Shopify JP `data-section-name="rock-steady"` / `home-rocksteady-section`（page top 9059px, h 777px @1440vw, capture 1425px 幅 = 実寸 ×0.99）。
> 構成 = **左: 回転地球（WebGL, 静的 DOM には不在）/ 右: 見出し + 短文**。数値スタッツは無し（事前観察の仮説は外れ）。

---

## 1. レイアウト構造

```
<section bg-deep-pine, dark, pb-0, overflow-x-clip, z-10>
 ├─ deco div A (absolute z-0, bg-contain, aspect 2074/1333, sm:w-130% left-[-15%] top-[-4%])
 ├─ deco div B (absolute z-0, bg-contain, sm:aspect 1440/819, xl: 1804×907px, left-1/2 -translate-x-46%)
 └─ container (12-col grid, gap-x-gutter, sm:gap-y-lg)
     ├─ 左カラム col 1-6 (md:col-span-6, sm:h-[54vw] xl:h-[907px], z-10)
     │   └─ #globe-container (absolute, xl: 1368×1368px, top:-220px, left:-336px) ← 空 div。canvas は runtime 注入
     └─ 右カラム md:col-start-8 col-span-5 / lg:col-start-9 (z-20, sm:justify-center = 縦中央)
         ├─ h3  (text-t4, mb-md, md:w-2/3)
         └─ p   (text-body-sm !text-b3 text-gray-b text-balance)
```

| 項目 | 値（実測 / DOM） |
|---|---|
| 背景色 | `#041E18`（capture rgb(4,30,24)、token 名 `deep-pine`） |
| section padding | `pt-0`（desktop。mobile は pt-[90px]）/ `pb-0` |
| section 高さ | capture 777px。ただし左カラムは `xl:h-[907px]` → 次 section（rounded-t-5xl の card）が下に被さり実質 777px 露出 **[要実測]** |
| 右カラム実測位置 | x ≈ 945–1230（1440 換算）、テキスト塊 y 230–544 で section 縦中央 ✓ |
| h3 → p 間隔 | 視覚 gap ≈ 35px → `mb-md`（≈ 24px と仮定 **[要実測]**） |
| 次 section との関係 | 直後の `conversion` section が同じ deep-pine ラッパー上に `rounded-t-4xl/5xl` で乗る（card 重なり演出） |

## 2. 要素インベントリ

| 要素 | テキスト | font | 実測値 | 色 |
|---|---|---|---|---|
| h3 `.text-t4` | 圧倒的な安定性。驚異的なスピード。 | Noto Sans JP | **fs ≈ 45px / lh ≈ 55px**（capture 44/54）。weight 330–400 **[要実測: getComputedStyle で token 確定]** | `#FFFFFF` |
| p `.text-b3` | 説明文 1 文（§3 参照） | Noto Sans JP | **fs ≈ 17–18px / lh ≈ 29px**（行 pitch 28.5 capture） | `#99B3AD`（`gray-b`） |
| globe | aria-label「マーチャントから近隣・遠方の顧客への売上を示す線が付いた回転する地球」 | — | xl 1368×1368px、section 左上に bleed（top −220 / left −336） | 地球 = 深緑系ドット、弧 = 明色 **[要実測]** |
| deco bg ×2 | なし（CSS background-image、capture では不可視） | — | 上記 §1 | glow / 光条と推定 **[要実測]** |

CTA・img・SVG ロゴ・数値カウンタは **この section には存在しない**。

## 3. テキスト計画

| 要素 | 採用文言 | 備考 |
|---|---|---|
| h3 | 圧倒的な安定性。驚異的なスピード。 | 短い機能的見出し → 原文 OK |
| p | アクセスが集中する大型セールのさなかでも、あなたのストアは落ちずに動き続けます。 | 原文（先行販売×安定稼働、約 45 字）と同義・同尺の **新規 paraphrase**。「Shopify」固有名は出さない |
| globe aria-label | 店舗から世界中の顧客への注文の流れを示す線が付いた、回転する地球のアニメーション | paraphrase 済 |

## 4. motion 仮説

| # | 対象 | 挙動仮説 | 根拠 / 検証 |
|---|---|---|---|
| 1 | globe | viewport 進入で WebGL canvas を **lazy mount** → 地球が等速自転、地表 2 点間を弧（注文ライン）が次々に描画→消滅 | 静的 DOM に `<canvas>` ゼロ + 空 `#globe-container` + aria-label。回転速度・弧の発生間隔・色 **[要実測: 進入後 frame burst]** |
| 2 | テキスト塊 | reveal なしの静置と推定（隣接 §11 にあった `opacity-0 translate-y-4 delay-[660ms]` 系クラスがここには無い） | **[要実測: scroll 進入時の transition 有無]** |
| 3 | deco bg | 静的（animate-* / transition-* クラスなし） | animations.json にこの section の項目ゼロ |
| 4 | section 接合 | scroll で次 section の rounded card が deep-pine 上にそのまま続く（parallax なし） | sticky / scroll-driven クラスなし |

## 5. アセット置換計画（本家 CDN の DL / 複製禁止）

| 本家アセット | 置換 |
|---|---|
| WebGL 回転地球 + 売上ライン | **(a) CSS/SVG モック**: SVG ドットマトリクス球（経緯度グリッドで dot 配置を事前計算した `<circle>` 群）を `motion/react` で 360° 回転（rotate を svg group に、60s/loop 線形）。弧 = `<path>` の `pathLength` を motion で 0→1→0 ループ（stagger 1.2s、3–5 本）。色: 球ドット `#1E4A3E` 系 / 弧 `#FFFFFF`→`#99B3AD` gradient |
| deco glow 背景 ×2 | **(a) CSS モック**: `radial-gradient` 2 枚（deep-pine より +4〜6% 明度の緑 glow）。実測後に調整 |
| ブランド名 | 本文から固有名排除済（§3）。ロゴ類はこの section に無し |

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

| 項目 | 内容 |
|---|---|
| ファイル | `src/shopify-jp/sections/SpeedSection.tsx`（named export `SpeedSection`）+ `src/shopify-jp/sections/GlobeMock.tsx`（named export `GlobeMock`） |
| SpeedSection | 純 presentational。state / effect **不要**。`<section class="relative z-10 overflow-x-clip bg-[--color-deep-pine] ...">` + 12-col grid。token は `@theme` に `--color-deep-pine: #041E18` / `--color-gray-b: #99B3AD` を追加 |
| GlobeMock | `useMemo` でドット座標生成（state 不要）。`whileInView` + `useInView` で viewport 進入時のみ回転開始（本家の lazy mount を模倣）。`prefers-reduced-motion` で静止 |
| 弧アニメ | `motion.path` の `animate={{ pathLength: [0,1,1], opacity:[0,1,0] }}` + `transition={{ repeat: Infinity, duration: 4, delay: i*1.2 }}` |
| a11y | globe wrapper に `aria-label`（§3）+ `role="img"`、テキストは通常 DOM |

### 要実測まとめ（6 件）
1. `text-t4` の正確な fs/weight token　2. deco bg の実画像　3. globe の mount トリガー・回転速度・弧 cadence・色　4. テキスト reveal の有無　5. section 実高さ / 次 section の被り量　6. `mb-md` / `gap-y` token 実値
