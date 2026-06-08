---
title: Bright Infrastructure — Design DNA Study（Stripe / Sierra / dLocal / Adyen / Nubank）
updated: 2026-06-04
status: research（実測トークン込み・fetch / getComputedStyle 確認）
purpose: 模倣でなく「明るい近未来インフラ」の視覚原則を抽出し、Andes に転用すべき/してはいけない要素を整理
---

# Bright Infrastructure Design DNA

> Andes 投資家サイトの **明るい近未来インフラ（bright futuristic infrastructure）** トーン（ダーク宇宙版の対案）のための DNA 抽出。
> Andes 要素 = São Paulo / LATAM commerce / Agentic Commerce / Brazil infrastructure。色は **Crimson #C8102E を pin-point**、restrained、紫グラデ/レインボー slop NG、**Stripe 風に寄せるが Stripe clone にしない**。

## 0. 結論（1 段落で）
**「bright futuristic」は彩度で作るのではなく、〈白/明るい基調〉×〈一点だけの高彩度アクセント〉×〈純黒を避けた濃紺インク〉×〈細〜中ウェイトの大見出し（−0.02em）〉×〈数字を独立 section に〉で作る。** 5 社すべてが「アクセント色は CTA など一点だけ」を守る（Stripe=purple / Sierra=green / dLocal=electric blue / Adyen=green / Nubank=violet）。これは Andes の Crimson pin-point 戦略の裏取りそのもの。役割分担: **Adyen = "restraint/精度/静けさ" の手本（最重要）**、**Stripe = 白×光の帯（gradient）骨格**、**dLocal = 青ドットグリッドの "インフラ図面" 感 ＋ 地域=統計**、**Sierra = agentic を chat overlay で実演**、**Nubank = 「1色を全面所有」は逆に回避対象**。

## 1. 実測トークン（getComputedStyle / pixel sample）
| site | 背景 | インク(本文) | アクセント(用途) | hero 見出し | CTA |
|---|---|---|---|---|---|
| **Stripe** | 純白 #FFFFFF（全 section） | 濃紺 #061B31（純黒でない） | purple #533AFD（CTA/リンクのみ） | 44px / **weight 300** / lh1.15 / −0.02em | radius **4px** 単色＋ghost |
| **Sierra** | 下層 白 / hero 全面動画 | 温かい暗褐 #302E2D | green（CTA のみ） | 65px / weight 400 / lh1.1 / −0.02em | **pill 9999px** |
| **dLocal** | hero 深紺 #0D0095 / 以降 白 | near-black navy #2D3139 | electric blue #1043FA（CTA） | 73px / weight 600 / −5% / Plus Jakarta | pill 33px |
| **Adyen** | 深紺 #001222 / 白 / off-white #F6F5F4 | （濃紺面に白） | green #00D16A（**CTA のみ・最厳格 1色**） | 可変 weight 484/492 / tracking **0** | radius **6px**（硬質） |
| **Nubank** | violet #8D0DE3 / IR は白 | — | violet（**全面所有**） | 112px / weight 600 / −1.4px | pill 999px |

## 2. bright futuristic の視覚原則（横断）
1. **白/明るい基調を「面」、高彩度を「点」**。色は足すほど安い。Stripe は白の海に光の帯 1 本、Adyen は濃紺に green 1 点。
2. **純黒を使わない**。本文は濃紺/温暗（#061B31 / #302E2D / #2D3139）。これだけで硬さが消え premium・futuristic に見える。
3. **大見出しは bold で押さない**。300〜400 の細〜中ウェイト＋ −0.02em。サイズは投資家向けで 44〜73px レンジ（Nubank の 112px は consumer 用で過剰）。
4. **futuristic = 彩度でなく余白・精度・静けさ（Adyen）**。tracking ほぼ 0、可変フォント中間 weight、CTA 角は意図的（4–6px の硬質 or 9999px の pill、中途半端な 8px SaaS を避ける）。
5. **"インフラ図面" 感はドットグリッド/細線で出す（dLocal）**。色を足さず中立色で。

## 3. Hero の構造（横断）
- **非対称 段組: 左テキスト / 右ビジュアル**（Stripe / dLocal）。Sierra は全面動画＋左テキスト。
- **eyebrow にライブ数字 or proof**（Stripe: 「Stripe 上の決済額が世界 GDP の 1.658…%」がリアルタイム加算）。
- 見出し → sub 1 文 → **CTA 2 つ（単色＋ghost）** → すぐ下に**顧客/規制ロゴ列**。
- **CTA は単色**（多色/グラデボタン禁止、5 社全て単色）。

## 4. motion pattern（横断）
- **gradient は WebGL + 静的 PNG fallback の二段**（Stripe: `hero-wave-animation__canvas` WebGL2 ＋ `wave-fallback-desktop.png`）。JS 無効でも崩れない。
- gradient はゆっくり流動（うねる）。**scroll-jack しない**、reveal は控えめ。
- **eyebrow 数字のライブインクリメント**（Stripe）。
- Sierra は hero に gradient を使わず、**実写動画 ＋ chat バブルの時間差 fade-in**（agentic の実演）。
- Adyen/dLocal/Nubank の precise motion は `[unverified]`（静的寄り）。

## 5. gradient / abstract visual の使い方（★）
- **Stripe**: 「流れる光の帯」1 本（面塗りでない）。実測色 = **暖色主体（orange #FE9116 + pink #FB8CEB/#FF55AA）に冷色（periwinkle/青紫 #7F7DFC）を一端だけ**。レインボー全色ではない。
- 再現手段（license 込み）: **@shadergradient/react（MIT）** か **drei shaderMaterial + 自作 GLSL（既導入・色を完全制御で slop 回避に最適）**。CSS `conic/radial-gradient + blur` は軽量 fallback。**whatamesh は LICENSE NG**。
- **dLocal**: 青ドットグリッド `radial-gradient(circle at 1px 1px, …)` ＋ 淡青面 ＝ インフラ図面。地域別カードは **muted な単トーン斜めグラデ**（地域ごと 1 色、レインボーでない）。
- **Adyen**: 抽象を最小化。oklab の極細 radial で hero 暗部フェードのみ。**slop ゼロ**。製品写真＋数字の "格"。
- **Sierra**: abstract gradient を使わず、**chat overlay＋プロダクト UI モックで "具体"**。
- **Nubank**: 装飾 gradient なし。実写カード＋人物。

## 6. investor 向けに読みやすくする情報設計（横断）
- **数字を「装飾でなく独立 section の主役」に**（Stripe `stats-section` / Sierra "The results speak for themselves" / dLocal "$41B processed" / Adyen "€1.4T・99.999%"）。Andes の EC 証拠隔離（docs/07）と整合。
- **section は 1 メッセージ / 白で息継ぎ**。hero→顧客ロゴ→プラットフォーム→**数字章**→事例/開発者→CTA。
- **規制/免許/法人を proof として明示**（dLocal は国別免許、Adyen は banking license）。Andes は CNPJ / 規制 compliance を（public NG 数値は除き）信頼の証拠に。
- **eyebrow に proof 数字**（Stripe 型）。

---

## ✅ Andes に転用すべき（DO）
1. **白/明るい基調 ＋ Crimson #C8102E を一点**（5 社共通の最重要原則＝ anti-slop 解）。CTA・1 数字の下線・1 キーワードだけに Crimson。
2. **本文インクは純黒でなく濃紺**（例 #14213A 系）。Stripe #061B31 の発想。
3. **大見出しは weight 300–400 ＋ −0.02em**（bold で押さない）。48–64px レンジ。
4. **eyebrow にライブ/出典付きマクロ数字**（4 マクロ数字: 6.6億人/US$7,690億/2.1億人/1.7億人）＋ **数字を独立 stats-section に**。
5. **Adyen の "1色ルール＋精度＋静けさ" を全体規律に**（restrained premium の手本）。tracking ほぼ 0、CTA 角は意図的。
6. **agentic を chat overlay で実演**（Sierra）。Andes の Agentic Commerce / WhatsApp agent をそのまま hero/section の小さな会話片で。
7. **dLocal の中立ドットグリッド**で "インフラ図面" 感（色を足さず）。
8. **gradient は WebGL + 静的 fallback の二段**、形は「流れる光の帯」1 本。
9. **地域＝統計＋規制/法人で接地**（写真でなく数字・CNPJ）。

## ❌ 転用してはいけない（DON'T）
1. **Stripe の暖色レインボー（orange+pink+青紫）をそのまま** → 紫グラデ/レインボー slop NG。Andes は **Crimson 軸の単色〜2 トーン微グラデ**（crimson→深紅→白へ溶ける）に絞り、青/オレンジ/ピンクの多色は排除。
2. **Stripe gradient の clone**（形=帯は参考可、配色は Andes 固有に）。
3. **whatamesh**（LICENSE NG）。
4. **Nubank の「1色を全面所有」**（violet 物量）→ Andes は Crimson を**点で、面でない**。
5. **Sierra の全面実写・人物動画 hero / Nubank の生活写真** → Andes は agent 純抽象。人でインフラを説明しない（動画使うなら都市/物流/データの抽象）。
6. **dLocal の muted 多色カード（地域別の色分け）** → 多色化 NG。地域分けを色でやらない。
7. **Nubank の 112–156px 超大型 consumer タイポ** → 投資家には過剰。Adyen 的な格のあるスケールへ。
8. **generic な "light theme + blue CTA"** = Stripe clone / SaaS slop。第2色（青/緑）を足さず Crimson のみで futuristic を出す。

---

## Andes 適用方針（bright 版の核）
**bright futuristic を「第2の色」なしで作る** = Adyen の restraint（精度・静けさ・1色）× Stripe の白×光の帯（ただし Crimson のみ）× dLocal の中立ドットグリッド × Sierra の agentic chat 片。globe/Japan⇄Brazil/agentic の DNA はダーク版と共有し、トーンだけ light に振る。→ 具体は `design/specs/hero-light-futuristic-production-spec.md`。

## 出典（fetch / getComputedStyle 確認済）
- stripe.com（→/jp, getComputedStyle・canvas pixel sample）/ sierra.ai（実測・スクショ）
- dlocal.com・investor.dlocal.com / adyen.com / nubank.com.br・investidores.nu（getComputedStyle・WebFetch・WebSearch 補完）
- 制約: firecrawl クレジット切れ→Chrome DevTools 実測で代替。motion timing は 3 社 `[unverified]`。Adyen hero px はレスポンシブ縮小値 `[partially-verified]`。
- 関連: docs/11（参考ライブラリ）/ docs/04（色 lock）/ design/research/brazil-visual-language.md
