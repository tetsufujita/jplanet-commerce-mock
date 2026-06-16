# src/shopify-jp/ — Shopify JP 学習用再現（Codex オリエンテーション）

> このフォルダは **shopify.com/jp ホームページの「学習用忠実再現」**。本サイト（Andes コーポレート）とは別物で、
> ルート `/shopify-jp` でのみ表示される motion 見本帳。**Fable が録画実測ベースで作った完成済みコード**を、
> Codex が細かく修正するためのガイド。まずこの README を読んでから編集すること。
>
> 状態（2026-06 時点）: 全 14 section + header/footer 実装済み・QA 済み。`lint / typecheck / test / build` 全緑。

---

## 0. 大原則（IP 境界・絶対に守る）

- **本家 Shopify の動画・画像・ロゴ・長文 copy を複製しない**。素材はすべて自前生成 or CSS/SVG モック。
- ブランド名は架空の **konoha 系**（konoha / amairo / lumora 等）。本家の merchant 名・アプリ名は使わない。
- チャネルアイコン等は「色と形の役割」だけ再現した**自作グリフ**（本家ロゴの忠実コピーは禁止）。
- 短い機能ラベル（「無料で始める」等）は原文可。**文章レベルの copy は同義の独自文に paraphrase**。
- 配信アセットは `public/shopify-jp/`。本家 CDN URL を直接参照しない。

---

## 1. ルート / エントリ

| 役割 | ファイル |
|---|---|
| ルート配線（lazy） | `src/App.tsx` の `/shopify-jp` → `ShopifyJpPage` |
| ページ shell | `src/shopify-jp/ShopifyJpPage.tsx`（`.sp-root` でラップ、section を縦に並べる） |
| ページ scoped CSS | `src/shopify-jp/shopify.css`（`.sp-root` フォント / `@keyframes sp-marquee` / reduced-motion 一括停止） |

ローカル確認: `pnpm dev` → http://localhost:5173/shopify-jp

---

## 2. section 構成（ページ上から順 = ShopifyJpPage.tsx の並び）

各 section は `sections/Sp*.tsx` の **named export**。`data-section="NN-..."` 属性付き（検証で参照）。
高さは @1440px の実測ターゲット（本家とほぼ一致済み・むやみに変えない）。

| # | component | 見出し | 高さ目安 | 色帯 | 主なアニメ |
|---|---|---|---|---|---|
| §1 | `SpHero` | 目指せ、次の◯◯（回転） | 851 | dark | 回転 H1 + **背景動画 5 本を語連動 crossfade** |
| §2 | `SpMerchantShowcase` | （タブ連動カルーセル） | 712 | dark | タブ自動送り 5.1s（`useAutoCycle`） |
| §3 | `SpChatSection` | ブランドがチャットに登場 | 647 | dark | **13.25s / 7 stage の chat デモ**（`useStageTimeline`） |
| §4 | `SpSellMore` | より多くの場所で、より多くの販売を | 1626 | dark | 大カード編集デモ + サブカード3枚（**カード1=チャネル吸い込み 8s**） |
| §5 | `SpGlobal` | 世界へ広がる可能性 | 828 | dark | 国旗/カード同期カルーセル（`useAutoCycle`） |
| §6 | `SpScale` | あらゆる規模のビジネスに | 1141 | dark | ロゴ marquee 60s |
| §7 | `SpSidekick` | 秘密兵器、Sidekick | 874 | dark | 紫グラデ + admin chat ループ + click 再生 stub |
| §8 | `SpApps` | アプリですべてをカスタマイズ | 625 | navy | アプリ marquee 240s + hover spotlight |
| §9 | `SpDevs` | 開発者向けリソース | 824 | navy | border-glow 周回 + reveal |
| §10 | `SpBuildEnv` | 構築に最適な環境 | 223 | pine | 静的（上角丸の帯） |
| §11 | `SpCheckout` | 世界最高レベルのチェックアウト | 718 | pine | reveal stagger + glow |
| §12 | `SpSpeed` | 圧倒的な安定性 | 778 | pine | **hand-rolled canvas 2D globe**（回転/drag/彗星弧/花火/tooltip） |
| §13 | `SpFinalCta` | Shopify でビジネスを迅速に構築 | 776 | black | 写真 crossfade（hover 駆動）+ reveal |
| §14 | `SpFooter` | footer | 564 | black | 静的 |
| — | `SpHeader` | sticky header + megamenu | 72 | — | scroll で dark 化 / hover megamenu |
| — | `SpPipVideo` | 右下固定 PiP 動画 | — | — | 常駐・閉じる可 |

---

## 3. 共有 UI プリミティブ（`ui/`）— 触る前にここを見る

| export | 役割 |
|---|---|
| `SpSection` | section 骨格。props `{ id, bg: "dark"\|"navy"\|"pine"\|"black", className }`。`data-section` を付与 |
| `SpContainer` | 中央寄せ max-w-1260 |
| `SpSectionHeading` | H2 55px/330 + 任意 aside |
| `SpPillButton` | pill ボタン（primary-white / outline-white / ghost、sm/md、icon） |
| `SpMarquee` | 無限スクロール帯（子を2連結・`{ duration, gap, reverse, pauseOnHover }`、reduced-motion 静的化） |
| `SpVideoFrame` | video 枠（src なし=gradient placeholder、読込後フェードイン、reduced-motion で poster） |
| `SpDarkCard` | deep-green カード（radius xl/2xl + hairline + shadow） |
| `SpCaptionBlock` | h4 + 説明文ブロック |
| `SpGlowEllipse` | 背景 radial glow 楕円（親に relative/overflow 必要） |
| `SpTextLink` | 下線リンク（gray→white hover） |

**共有 UI を勝手に作り変えない**（複数 section が依存）。section 固有の見た目は className 上書きで対応。

### アニメ用 hooks（`ui/hooks.ts`）

| hook | 用途 | 使用 section |
|---|---|---|
| `useRevealInView<T>(threshold)` → `{ref, inView}` | IO once の入場 reveal | §4 §9 §8 §13 §3 |
| `useAutoCycle<T>(length, intervalMs)` → `{ref, index, select}` | in-view 限定の等間隔巡回（reduced-motion 停止 / select でリセット） | §4 §5 §2 |
| `useStageTimeline<T>(stages)` → `{ref, stageKey, running}` | **可変長 stage の storyboard 駆動**（setTimeout chain でループ、in-view/reduced 停止） | §3 §4 §12 |

`stages` は **module-level const** で渡す（毎 render 生成すると timer が再起動する）。

---

## 4. デザイントークン

`src/styles/globals.css` の `@theme` に `sp-` prefix で定義（**本サイトでは使わない隔離トークン**）:

```
--color-sp-dark:    #02090a   (§1-7 背景)
--color-sp-navy:    #000a1e   (§8-9 背景)
--color-sp-pine:    #041e18   (§10-12 背景)
--color-sp-green:   #061a1c   (カード地)
--color-sp-avocado: #36f4a4   (アクセント teal)
--color-sp-gray:    #9dabad   (本文グレー)
--ease-sp: cubic-bezier(0.5, 0, 0.5, 1)
```

Tailwind では `bg-sp-dark` `text-sp-gray` `text-sp-avocado` 等で参照。
これ以外の色は arbitrary hex（`bg-[#0B1213]` 等）で直接指定している箇所も多い。

---

## 5. 大物カスタムシステム（修正時の注意が大きい順）

### A. §12 globe — `SpSpeed.tsx`（898 行）
- **hand-rolled canvas 2D**（Three.js / cobe 禁止）。正射影で球を回す。
- 陸ドット = `sections/globeDots.ts`（Natural Earth 110m 由来の `[lat,lon][]`、自動生成データ）。
- レイヤ: 星空 → 球地 → 陸ドット → 都市光 sprite → 彗星弧（加算発光）→ 着地 burst/花火 → rim light。
- 回転 idle 1.75°/s・drag trackball + 慣性・world-anchored tooltip 3 種（うち1つは live counter）。
- 正典 spec: `design/reproductions/shopify-jp/recordings/spec-s12-globe.md`。

### B. §3 chat デモ — `SpChatSection.tsx`（918 行）
- **13.25s / 7 stage** のストーリーボードを `useStageTimeline` で駆動（sweater→typewriter→bubble→phone reveal→sheet×2→constellation→Thank you push-through→暗転ループ）。
- 写真は生成アセット（`public/shopify-jp/knit-*.jpg` / `portrait-*.jpg`）。
- 正典 spec: `recordings/spec-s03-chat-demo.md` + `spec-s03-delta.md`（実写化差分）。

### C. §1 hero 背景動画 — `SpHero.tsx`（178 行）★一番よく触る
- 回転 H1 の語に連動して背景動画 5 本を 700ms crossfade。
- 3 つの const だけで制御: `ROTATING_WORDS` / `HERO_MEDIA`（`{key,src,poster}[]`）/ `WORD_MEDIA`（語→key）。
- key を増減したら `HeroMediaKey` union 型も更新。reduced-motion 分岐（静止画）を壊さない。
- 動画は `public/shopify-jp/hero-*.mp4`（1080p/無音）、4K マスターは `design/reference/higgsfield-req/*-4k.mp4`。

### D. §4 カード1 チャネル吸い込み — `SpSellMore.tsx`（935 行）
- `CHANNEL_STAGES`（8 stage / 8s）: card 出現→文字先消え→サムネがバッグへ下降→飲み込みパルス→線を伝う teal パルス→アイコンにリング点灯。
- 中央バッグは自作 SVG（`KonohaBagLogo`）。接続線は樹形トポロジー（`ConnectionLines`、viewBox 500×560 絶対座標）。
- 正典 spec: `recordings/spec-s04-card1-click.md`。

---

## 6. 「要実測」マーカー — 細かい修正の入口

不確実だった寸法・色・timing は各 section に **`// TODO(measure):`** コメントで残してある。
細かい修正はここを探すのが早い。現在の件数（多い順）:

```
SpDevs 8 / SpGlobal 6 / SpMerchantShowcase 6 / SpApps 5 / SpScale 5 / SpSidekick 5
SpCheckout 4 / SpSellMore 4 / SpFooter 3 / SpFinalCta 2 / SpBuildEnv 1 / SpChatSection 1 / SpHeader 1
```

`grep -rn "TODO(measure)" src/shopify-jp/sections/` で全部出る。

---

## 7. 実測の正典（修正の根拠データ）

`design/reproductions/shopify-jp/` に Fable が録画・実測したデータが全部ある:

| 場所 | 中身 |
|---|---|
| `specs/01-hero.md` 〜 `14-footer.md` | section 別 build spec（レイアウト/色/タイポ/motion 仮説） |
| `build-plan.md` | 14 section 統合計画 |
| `shopify-jp-specs.json` / `-animations.json` | 本家からの実測 dump |
| `recordings/rec-*.mov` | sir 提供の本家画面録画（§3/§11/§12/§4/カード1 クリック） |
| `recordings/spec-s*.md` | 録画フレーム解析から起こした実装 spec（これが各機能の正典） |
| `recordings/storyboard-f*.md` | フレーム時系列の生メモ |

**寸法・timing・色で迷ったら、まず該当 spec を読む**（本家サイトを直接見るより速く正確）。

---

## 8. 制約 & 完了条件

規約（`AGENTS.md` 準拠）:
- TypeScript strict / `any` 禁止（`unknown` + type guard）/ named export / unused import 禁止 / `console.log` 禁止
- アニメは `motion/react` のみ（GSAP/Lenis/Three/cobe 禁止。globe の canvas は素の rAF）
- import alias `@/*`、`../` 禁止
- 全アニメで `useReducedMotion` / `prefers-reduced-motion` 対応を壊さない
- section 全高を大きく変えない（±10px 目安。縦リズムが崩れる）

PR 前 mandatory（全部緑にする）:
```
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

---

## 9. 細かい修正のレシピ（よくあるやつ）

| やりたいこと | どこを触る |
|---|---|
| hero 動画と語の対応を変える | `SpHero.tsx` の `WORD_MEDIA` |
| hero 動画を差し替える | `public/shopify-jp/hero-*.mp4` を同名で上書き（コード不要） |
| 色帯・アクセント色 | `globals.css` の `sp-` トークン（全 section に効く） |
| section 内の余白・サイズ微調整 | 該当 `Sp*.tsx` の `TODO(measure)` 付近 |
| marquee 速度 | 該当 section の `<SpMarquee duration={...}>` |
| 自動巡回テンポ | 該当 section の `useAutoCycle(len, ms)` or `*_STAGES` const の ms |
| crossfade/フェード速度 | 該当要素の `transition` / Tailwind `duration-*` |
| section の並び替え | `ShopifyJpPage.tsx` の JSX 順序 |

> 新しい動画・画像の**生成**（Higgsfield）はこのリポジトリ内では完結しない。生成済みアセットの
> 差し替え・割当・再エンコードまでが Codex の守備範囲。新規シーンが要る時は Fable 側に依頼する。
