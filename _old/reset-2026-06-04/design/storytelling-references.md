---
title: Storytelling Cinematic References
updated: 2026-05-22
status: draft
purpose: design pivot（旧 Stripe/Shopify infra 案 → cinematic storytelling 案）の参考軸
method: 10 サイト playwright + WebFetch 実測（DOM / canvas / video / sticky / scroll ratio）
---

# 00 サマリー

| # | site | type | scroll 倍率 | canvas | video | WebGL | sticky pin | cinematic 度 | Andes 移植 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Sidewave | award SOTD | **52x** | 1 (全画面) | 0 | yes | yes | **10/10** | **9/10** |
| 2 | Apple Vision Pro | product story | **30x** | 0 | 28 | no | 13 | 9/10 | 8/10 |
| 3 | Apple AirPods Pro | product story | **25x** | 0 | 16 | no | 13 | 9/10 | 7/10 |
| 4 | Lusion | agency portfolio | 1x SPA | 3 | 0 | yes | n/a | 8/10 | 5/10 |
| 5 | Active Theory | agency portfolio | 1x SPA | 1 (全画面) | 2 | yes | n/a | 9/10 | 3/10 |
| 6 | Locomotive | agency portfolio | 5x | 2 (作品) | 1 | yes | yes | 7/10 | 6/10 |
| 7 | OnePlus global | product catalog | 7x | 0 | 0 | no | no | 2/10 | 2/10 |
| 8 | Dell XPS | product catalog | 3x | 0 | 0 | no | no | 1/10 | 1/10 |
| 9 | Apple Watch Ultra 2 | product catalog | 2x | 0 | 0 | no | no | 1/10 | 1/10 |
| 10 | x.ai | AI startup | 3x | 0 | 0 | no | no | 3/10 | 2/10 |
| 11 | Cognition | AI startup | 1.5x | 0 | 0 | no | no | 1/10 | 1/10 |

> 実測値（scroll 倍率 = `document.body.scrollHeight / window.innerHeight`、playwright で取得）

---

# 01 サイト別 1 行コメント

| site | 一言 |
|---|---|
| Sidewave | **章タイトル + 全画面 WebGL + cinematic 写真 + 紫グラデ + ライトレーザー**。最も Andes に近い構造 |
| Apple Vision Pro | 章ごと sticky pin + mp4 sequence で 3D 風演出（WebGL 不使用）、白基調、抑制美 |
| Apple AirPods Pro | 16 video の scroll-driven frame playback、章 = 機能、CTA 自然挿入 |
| Lusion | 全画面 Three.js + 45×45 cursor canvas（cursor 反応）、白背景に作品グリッド |
| Active Theory | 1 viewport 完結、中央 3D logo + 粒子 + light leak、SPA クリック遷移 |
| Locomotive | locomotive-scroll + GSAP、orange/black 強烈色、巨大セリフ、作品ごと WebGL thumbnail |
| OnePlus / Dell XPS / Apple Watch | カタログ型、cinematic 要素ゼロ。参考にしない |
| x.ai | h1 文字モーフィング（search/see/...）のみ、抑制型 AI 系 |
| Cognition | 1.5 viewport、ロゴ羅列の B2B 信頼演出。Andes には合わない |

---

# 02 10 次元抽出（cinematic 上位 6 サイトのみ）

## A. scroll experience（natural vs jacked）

| site | 挙動 |
|---|---|
| Sidewave | smooth scroll（Lenis 風）+ 章ごと WebGL bg 連動、scroll velocity 反映 |
| Apple AirPods Pro / Vision Pro | natural scroll + sticky pin で章を hold、jacking しない |
| Lusion / Active Theory | smooth scroll、cursor で WebGL 反応 |
| Locomotive | locomotive-scroll（jacked smooth、scroll bar カスタム） |

## B. chapter structure

| site | chapter 数 | 分け方 |
|---|---|---|
| Sidewave | 10 章 | 哲学 phrase（FEEL BEFORE YOU SEE / ABSORBING THE REALITY / ENGINEERING THE UNSEEN ...） |
| Apple Vision Pro | 7 章 | 機能（Design / Entertainment / Productivity / Photos / Connection / Apps / visionOS） |
| Apple AirPods Pro | 11 章 | 機能 + product viewer + CTA |
| Locomotive | 5 章 | hero / featured work / articles / culture / store |
| Lusion | 4 章 | hero / work / philosophy / contact |

## C. color transition

| site | 方式 |
|---|---|
| Sidewave | **紫 → 砂漠 sepia → 黒 → 青** の chapter bg fluid blend（WebGL shader で連続変化） |
| Apple Vision Pro | 章ごと bg fade（rgb(245,245,247) ↔ white ↔ black）、wipe ではなく cross-fade |
| Apple AirPods Pro | 白基調、製品 anim の中で色変化、bg は静止 |
| Locomotive | orange → black の bold blocking、blend なし |
| Lusion | 白基調 + 作品サムネ内で色爆発 |

## D. 3D / WebGL

| site | canvas 使用 |
|---|---|
| Sidewave | 全画面 WebGL 1 枚、chapter 連動で texture / 色変化 |
| Lusion | 全画面 Three.js + cursor canvas（45×45 がカーソル軌跡描画） |
| Active Theory | 全画面 WebGL（粒子 + 3D logo + light leak） |
| Apple 系 | **WebGL 不使用、mp4 frame playback で代替**（パフォーマンス / アクセシビリティ重視） |
| Locomotive | 作品サムネ用に WebGL（hover で歪み shader） |

## E. typography on scroll

| site | 演出 |
|---|---|
| Sidewave | 章タイトルが画面中央に巨大表示、scroll で fade-up + scale |
| Apple 系 | 文字 fade-in + 軽い scale、split-letter は使わない |
| Locomotive | 巨大セリフ大文字、scroll で位置スライド |
| x.ai | h1 内で単語が連続入れ替わる morph（search/see/...） |
| Lusion | headline スタガード reveal |

## F. section reveal（pin / parallax / horizontal）

| site | 方式 |
|---|---|
| Apple Vision Pro / AirPods Pro | **章 sticky pin × 13**、bg video 固定で前景が scroll、終わったら unpin |
| Sidewave | 章 pin + WebGL bg を scroll progress と連動（GSAP ScrollTrigger 型） |
| Locomotive | parallax + smooth scroll、horizontal scroll 一部 |
| Lusion / Active Theory | SPA、reveal なし |

## G. motion philosophy

| site | 哲学 |
|---|---|
| Sidewave | 過剰寄り。常に何かが動く（粒子 / 光 / camera drift） |
| Apple 系 | **抑制**。3-5 秒に 1 回、意味ある motion だけ |
| Lusion / Active Theory | 中庸、cursor reaction で「触れる感」を出す |
| Locomotive | 中庸、scroll velocity で texture が歪む |

## H. hero（最初の screen）

| site | hero |
|---|---|
| Sidewave | 紫グラデ砂漠 + 人影 + レーザー光 + 中央 phrase「A DISTILLED FUSION OF ELEMENTS, ENGINEERED INTO THEIR MOST EXTRAORDINARY FORM」 |
| Apple Vision Pro | 静止製品写真 + overlay text、video 不使用 |
| Apple AirPods Pro | mp4 製品回転 hero（loop muted） |
| Locomotive | orange bg + 人物半切れ + 巨大ロゴ |
| Lusion | 白背景 + 全画面 Three.js + 1 文 mission |

## I. CTA placement

| site | 配置 |
|---|---|
| Apple 系 | 上部 sticky nav + 章末ごと小 CTA + footer 大 CTA |
| Sidewave | nav + chapter 終端「Reach Us」 |
| Lusion / Active Theory | nav + 最終章「Let's talk」 |
| Locomotive | nav「Let's talk」常駐 + footer |

## J. Andes 移植スコア（理由 1 行）

| site | score | 移植理由 |
|---|---|---|
| Sidewave | **9** | 章構造 + 全画面 WebGL + cinematic 写真の組み合わせが Andes vision の規模感に直結 |
| Apple Vision Pro | **8** | sticky pin × 章 = Andes の 7-8 章を破綻なく見せる骨格そのまま使える |
| Apple AirPods Pro | **7** | mp4 frame playback はパフォーマンス安全策（WebGL fallback として有効） |
| Locomotive | **6** | smooth scroll + 巨大タイポ + brand bold color は Andes brand 表現と相性良 |
| Lusion | **5** | cursor reactive canvas は paint texture アイデアと一致、ただし全体構造は portfolio 型で Andes には合わない |
| Active Theory | **3** | SPA 1 viewport 完結型、Andes の 8 章 message には不適 |

---

# 03 Top 3 推薦サイト（Andes が盗むべきもの）

## 1 位: Sidewave（https://sidewave.it/）

```
盗む:
├─ 章構造: 10 章 = 哲学 phrase + 全画面 WebGL bg 連動
├─ 色変化: 紫 → 砂漠 → 黒 → 青 の fluid blend（shader）
├─ hero: 中央巨大 phrase + 一枚絵風 cinematic 背景
└─ 抽象度: 「中南米の新しい基盤」を「写真 1 枚 + 哲学 1 文」で見せる構造
捨てる:
└─ 章タイトルの中二病感（ENGINEERING THE UNSEEN 等の抽象詩語）
```

## 2 位: Apple Vision Pro（https://www.apple.com/apple-vision-pro/）

```
盗む:
├─ sticky pin による章の hold（13 sticky × 7 章 = Andes の 7 章設計に直適用）
├─ scroll-driven mp4 playback（WebGL 不要、軽量、アクセシビリティ OK）
├─ 抑制された motion（3-5 秒に 1 回）
└─ CTA を章末に自然挿入する pattern
捨てる:
└─ 白基調の Apple 色は Andes brand と違う（Andes は LATAM 色 = 大地 / 太陽 / 海）
```

## 3 位: Locomotive（https://locomotive.ca/）

```
盗む:
├─ locomotive-scroll（smooth scroll の実装基盤、Lenis 代替）
├─ 巨大セリフタイポ + scroll で歪む texture
├─ brand bold color の使い方（Andes は 1 章ごと 1 色支配）
└─ scroll velocity で texture が反応する仕組み（paint texture アイデアと直結）
捨てる:
└─ 章数 5 で portfolio 寄り、Andes は story 寄りに作り直す
```

---

# 04 Andes 章設計案（7 章、message → 色 → 演出）

> 出典: `docs/05_pages-spec.md` の Top page IA（Hero / Vision / 2 layer / 3 businesses / Phase / Protocol / Group + CTA）を **章** に再編。

```
┌──────────────────────────────────────────────────────────────────┐
│ 章 1  OVERTURE（hero）                                            │
│ message: LATAM Agentic Commerce のインフラを建てる                 │
│ 色: 深夜青 → 黎明オレンジ（Japan → BR の時差を太陽で表現）           │
│ 演出: 全画面 WebGL paint texture、cursor で塗料が流動                │
│ duration: 1.5 viewport, sticky pin                                │
├──────────────────────────────────────────────────────────────────┤
│ 章 2  WHY NOW                                                     │
│ message: 中南米 $6T 経済 / AC 巨人 merchant 不在 / 二重国籍 founder │
│ 色: 黎明オレンジ → 大地 sepia                                       │
│ 演出: 3 keypoint を scroll-driven mp4 で 1 つずつ pin reveal       │
│ duration: 3 viewport, 3 sticky chapter                            │
├──────────────────────────────────────────────────────────────────┤
│ 章 3  2 LAYER ARCHITECTURE                                        │
│ message: 購入 agent（巨人を LLM 化）+ プラットフォーム（深層 moat） │
│ 色: 大地 sepia → 緑（Andes 山脈の植生）                              │
│ 演出: 2 層構造図が scroll で組み上がる SVG animation（WebGL 不要）   │
│ duration: 2.5 viewport, sticky pin                                │
├──────────────────────────────────────────────────────────────────┤
│ 章 4  THREE BUSINESSES                                            │
│ message: J-Planet / J-Vita / LATAM AC Protocol                    │
│ 色: 緑 → 商品写真 vivid（化粧品ピンク + 医療白 + protocol 青の 3 帯）│
│ 演出: horizontal scroll で 3 事業を順に reveal、各事業は 1 写真 + 1 文│
│ duration: 4 viewport（3 事業 × 1.3）, horizontal pin                │
├──────────────────────────────────────────────────────────────────┤
│ 章 5  PHASE ROADMAP                                                │
│ message: Phase 1（2026-06）→ Phase 4 Agentic Fintech（2029-30）   │
│ 色: vivid → 夕焼け赤紫（時間の流れ）                                  │
│ 演出: timeline 横軸を scroll progress で進める、年が大きく入れ替わる │
│ duration: 3 viewport, sticky pin                                  │
├──────────────────────────────────────────────────────────────────┤
│ 章 6  PROTOCOL ENDGAME                                             │
│ message: 2028 LATAM AC Protocol（PIX / NF-e / ICMS の MCP 発行）   │
│ 色: 夕焼け → 漆黒 + neon teal アクセント（インフラ / プロトコル感）  │
│ 演出: 全画面 WebGL に戻る、network graph がカメラ drift で広がる    │
│ duration: 2 viewport, sticky pin                                  │
├──────────────────────────────────────────────────────────────────┤
│ 章 7  GROUP + CTA                                                 │
│ message: Andes Inc. / Andes BR / J-Planet 構造 + 4 窓口 CTA       │
│ 色: 漆黒 → 朝の白（次の章 = 訪問者の action へ）                     │
│ 演出: paint texture が消えて静止、CTA 4 つが順に fade in           │
│ duration: 1.5 viewport, natural scroll                            │
└──────────────────────────────────────────────────────────────────┘
合計: 約 17.5 viewport（Apple Vision Pro 30x の約半分、ちょうど良い長さ）
```

---

# 05 Cursor reactive paint texture の役割

| 章 | paint texture |
|---|---|
| 1 Overture | **全画面**、cursor で塗料が流動（heaviest） |
| 2 Why now | bg のみ、前景は mp4 |
| 3 2 Layer | **OFF**、SVG 図がメインで paint は邪魔 |
| 4 Three businesses | **OFF**、商品写真がメイン |
| 5 Phase | 軽い paint（time の流れの metaphor として） |
| 6 Protocol | **全画面**、network graph と blend |
| 7 Group + CTA | 消える（静寂で締める） |

```
判断基準: paint = abstract / philosophical な章のみ使う。
具体（事業 / 数字 / 図表）が出る章では OFF にして集中させる。
```

---

# 06 scroll-jacking vs natural scroll

| 観点 | scroll-jacking | natural scroll |
|---|---|---|
| 制御 | ◎ 章の見せ方を完全に制御 | △ 速くスクロールされると章を skip |
| パフォ | △ 重い | ◎ 軽い |
| アクセシビリティ | × prefers-reduced-motion 配慮必要 | ◎ |
| 投資家向け（DD 速読） | × イライラ | ◎ |
| brand 体験 | ◎ 没入 | △ 普通 |
| Apple の選択 | ✗ jacking しない | ✓ sticky pin で代替 |
| Sidewave の選択 | △ smooth scroll 強め | ✗ |

```
sir-decision 推奨: natural scroll + sticky pin（Apple 方式）
理由:
  1. 投資家 DD で速読される時に章を skip させない最低限の制御は sticky pin で十分
  2. WAI-ARIA / prefers-reduced-motion 対応が容易
  3. Lenis は smooth scroll の easing のみ使う（scroll-jacking はしない）
  4. paint texture と sticky pin の組み合わせで cinematic 感は出る
```

---

# 07 実装スタック推奨

```
Lenis              smooth scroll easing（jacking なし）
GSAP ScrollTrigger 章 sticky pin / scroll progress 連動
Three.js (r3f)     章 1 / 6 の全画面 WebGL（paint texture + network graph）
next/image         全 still 写真
<video muted loop> 章 2 の scroll-driven mp4（Apple 方式）
prefers-reduced-motion media query で全演出を OFF できる fallback 必須
```

---

# 08 残課題（sir-decide 必要）

| 項目 | 選択肢 | 推奨 |
|---|---|---|
| 章 4 horizontal scroll の採否 | yes / no | yes（Phase 1-4 と差別化） |
| paint texture の色数 | 2 / 3 / 7（章毎） | 3（過剰防止） |
| 章 1 hero copy 案 | docs/02 翻案ガイド表現を使う | 「LATAM Agentic Commerce のインフラを建てる」 |
| BGM | あり / なし | なし（accessibility 優先） |
| 言語切替 UX | nav 固定 / 章 7 で大きく | nav 固定（cinematic を壊さない） |

---

# 09 出典

- Sidewave: https://sidewave.it/（Awwwards SOTD / Developer Award 2026）
- Apple Vision Pro: https://www.apple.com/apple-vision-pro/
- Apple AirPods Pro: https://www.apple.com/airpods-pro/
- Apple Watch Ultra 2: https://www.apple.com/apple-watch-ultra-2/
- Active Theory: https://activetheory.net/
- Locomotive: https://locomotive.ca/
- Lusion: https://lusion.co/
- OnePlus global: https://www.oneplus.com/global
- Dell XPS: https://www.dell.com/en-us/shop/dell-laptops/sf/xps-laptops
- Cognition: https://cognition.ai/
- x.ai: https://x.ai/
- 実測 method: playwright（scrollHeight / canvas / video / sticky 数）+ WebFetch（content 文脈）
