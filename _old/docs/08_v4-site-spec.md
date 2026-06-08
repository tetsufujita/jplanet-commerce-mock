---
title: 08 v4 コーポレートサイト per-section spec
purpose: /preview/v4 の SSOT。Stripe.com/en-br 骨格 × Sierra.ai 表現で、セラー勧誘＋採用へ導く ja/en サイト
status: spec（2026-05-29 sir-decided、実装はここから引く）
updated: 2026-05-29
---

# 08 v4 コーポレートサイト per-section spec

> サイト掲載 copy（ja / en）と各 section の構成・動き・出口の **唯一の真実**。
> 数値は本 doc の [verified] 表から引く（ハードコード禁止、`messages/{ja,en}.json` に key 化）。

---

## 前提（sir-decided 2026-05-29）

| 項目 | 確定内容 |
|---|---|
| 骨格（構成） | **Stripe.com/en-br** — merchant/seller プラットフォーム訴求が Andes に近い |
| 表現（動き） | **Sierra.ai** — 液体ガラス chat / floating UI / 静かな stagger reveal。特に hero |
| 言語 | **ja / en 主軸**（見出しは両言語で成立する「言い切り型」）。pt-BR は後回し（hero chat 内の会話だけ PT-BR consumer demo として維持） |
| 目的 | サイト全体を **① セラー勧誘（日韓ブランド募集）/ ② 採用** の2出口へ導く funnel |
| 構成 | **5大ブロック**：① Hero ② サービス説明 ③ ニュース ④ 数字 ⑤ 採用（＋ nav / final CTA / footer） |
| 数値ポリシー | 外部の公開マクロ統計のみ（一次ソース＋年＋[verified]）。Andes 機密（SKU / PRC唯一 / 24ヶ月先行 / Series A 数値）は不掲載 |
| 禁則 | 「北極星」語 NG → 「2028年に LATAM の共通インフラを protocol として発行」/ 商社参考 NG / 「中南米の王」→「中南米経済の新しい基盤を作る」 |

---

## 全体構成図

```
ANDES v4  —  skeleton: Stripe /en-br   |   motion: Sierra   |   exits: ①セラー ②採用
┌──────────────────────────────────────────────────────────────┐
│ NAV          透明→scroll で白blur（Sierra homepage-aware）       │
│ 1 HERO       動画+液体ガラス chat（Sierra）＋5億→6.6億人 scale    │
│              出口 →［販売を開始する］                            │
│ 2 サービス説明 本物の商品画面 bento ＋ 2層インフラ統合図          │
│              （Stripe bento + Connect-to-systems 図を内側に圧縮） │
│              出口 →［販売を開始する］                            │
│ 3 ニュース    横スクロール story carousel（Stripe newsroom）       │
│ 4 数字        4数字（Stripe stats）＋ three-fluid-fx 流体          │
│              出口 →［販売を開始する］                            │
│ 5 採用        「一緒に建てる」＋2つの扉                           │
│              出口 →［セラーとして売る］［チームに参加］          │
│ FINAL CTA    セラー / 採用 の2 path                              │
│ FOOTER       sitemap + 言語(ja/en) + 法人情報・CNPJ（docs/01）    │
└──────────────────────────────────────────────────────────────┘
上ほど Sierra 表現を濃く、下ほど Stripe の静けさへ減衰。accent は Final CTA で初満開。
```

### Stripe /en-br → Andes 対応（1:1）

| Stripe /en-br バンド | → Andes ブロック | status |
|---|---|---|
| Hero + GDP ticker | §1 Hero（5億→6.6億人 を scale anchor に） | keep |
| Bento「Flexible solutions」(Monetize through agentic commerce 含む) | §2 サービス説明（前半 bento） | rework |
| Developer infra「Connect to existing systems」図 | §2 サービス説明（後半 2層統合図） | rework |
| Newsroom carousel | §3 ニュース | new |
| Stats「Backbone of global commerce」 | §4 数字 | new |
| Audience accordions / Book of the week | §5 採用（＋セラー/採用の語り） | new |
| Final CTA | Final CTA | new |
| Mega-footer | Footer | new |

---

## 現 §1〜§3 診断（なぜ0点だったか）

| 現 section | 問題 | 直し方 |
|---|---|---|
| §1 Hero (`HeroV4.tsx`) | 唯一の強み（Sierra 再現済）。ただ Stripe が必ず置く「冒頭の定量アンカー1個」が無く、唯一出せる数字が段落に埋もれる | ほぼ維持。H1 上に scale strip を足し **人口数字を hook に昇格** |
| §2 Services (`ServicesV4.tsx`) | **最大の欠陥**。Stripe bento は「実在する商品画面のグリッド」なのに抽象アイコン＋手書き2層図。glass/blur 装飾ばかりで product proof 不在。3つの別バンドを1枚に潰している | **本物の product-surface bento** に作り直し＋2層図は同ブロック後半の統合図へ分離。重複 ChatPreview は削除（hero が chat を持つ） |
| §3 Network (`NetworkV4.tsx`) | ハブ&スポークは Stripe に無い唯一最も off-model な要素（「全部が我々に繋がる」自画自賛＝北極星抵触） | **廃止**。dashed-flow 動きは §2 後半の統合図へ転用 |

---

## per-section spec

> copy は **草案**。ja / en 併記。確定後 `messages/{ja,en}.json` に key 化（`.tsx` ハードコード禁止）。

### NAV（sticky）
- **役割**：常設ナビ＋主要 CV 導線。**status: new**
- **layout**：左 Andes wordmark / 中央 事業・プラットフォーム・会社・採用・プレス / 右 言語(ja/en)＋ ghost「Andes について」＋ solid「販売を開始する」
- **motion**：Sierra homepage-aware — hero 動画上は透明 white、動画が抜けたら白 blur ＋ dark text へ
- **copy**：`事業 / プラットフォーム / 会社 / 採用 / プレス`｜en `Business / Platform / Company / Careers / Press`

### §1 HERO（`HeroV4.tsx` を維持＋scale strip 追加）
- **役割**：トップの価値提案。**出口：販売を開始する**。**status: keep（微追加）**
- **layout**：full-bleed cycling 動画。左＝scale strip＋eyebrow→巨大 italic→subhead→2 CTA／右＝自走 PT-BR 買い物 chat（液体ガラス）。現グリッド維持
- **copy（草案）**
  - scale strip：`ラテンアメリカ 6.6億人の経済が、ここで動き出す。`｜en `An economy of 660 million people starts here.`
  - 巨大見出し：`Agentic Commerce.`（italic、両言語共通）
  - subhead：`Andes は、日本と韓国のブランドがラテンアメリカ 6.6億人へ届くための Agentic Commerce プラットフォーム。会話の裏で、物流・決済・税務・通関を Andes が引き受ける。`｜en `Andes is the agentic commerce platform that carries Japanese and Korean brands to 660 million people across Latin America. Behind the conversation, Andes runs logistics, payments, tax, and customs.`
  - CTA：`販売を開始する →` / `Andes について`｜en `Start selling →` / `About Andes`
- **visual**：暖色のブラジル人物動画 cycle ＋ R$ 商品カード/CIF・II レシートの glass chat。H1 上に静かな `6.6億人` scale anchor
- **motion（維持）**：動画 Ken-Burns/crossfade、chat 自走（user→glass agent→商品カード→注文明細）、scenario progress pills、chat 天井=最初の3 bubble 分（[[v4-hero-chat]]）。**追加**：subhead/CTA の fade-rise、scale の数字 count-tick 1回（Stripe ticker 感）

### §2 サービス説明（`ServicesV4.tsx` を作り直し＋`NetworkV4.tsx` 吸収）
- **役割**：プラットフォームの幅を「実在する商品画面」で証明＋深層インフラ(2層)。**出口：販売を開始する**。**status: rework**
- **layout**：2パート。
  - **前半 bento**（Stripe「Flexible solutions」型・非対称グリッド）：各タイル＝**成果見出し＋実画面 mockup（loc 通貨 R$）**
    - 大タイル：エージェント店頭（WhatsApp 会話→商品カード R$→購入）
    - 税・通関レシート（CIF / II 60% / ICMS の内訳 R$）
    - 越境物流トラッキング（集荷→通関→配送・4–7 dias）
    - PIX・NF-e カード（現地決済＋電子インボイス発行）
    - ERP/在庫 小タイル（Phase 表示）
  - **後半 統合図**（Stripe「Connect to existing systems」型・方向性フロー）：世界の AI → Andes 購入エージェント → Andes プラットフォーム(物流/税/法/通関/ERP/fintech) → ブランド & 消費者。2層構造を縦スタックで内包。endgame ノード＝2028 protocol（旧 NetworkV4 の dashed-flow を edge data-flow として再利用）
- **copy（草案）**
  - 前半 H2：`あらゆるブランドの、あらゆる売り方に。`｜en `Every brand. Every way to sell.`
  - リード：`決済・物流・税務・通関を一つにまとめた道具立て。単体でも、組み合わせても動く。`｜en `Payments, logistics, tax, and customs in one toolkit—designed to work alone or together.`
  - タイル見出し（成果起点）：`会話だけで、売れる。`／`関税も税金も、自動で計算。`／`集荷から配送まで、4–7 日。`／`PIX も NF-e も、最初から。`／`在庫も会計も、エージェントに。`
  - 後半 H2：`会話の裏に、深いインフラ。`｜en `Deep infrastructure behind the conversation.`
  - リード：`上の層は世界の AI を使い、ブランドと消費者に向き合う。下の層は現地に深く根を張る、誰にも作れない基盤。本当の価値は、下の層にある。`｜en `The top layer uses the world's AI to face brands and consumers. The lower layer roots deep in the region—infrastructure no one else can build. The real value is in the lower layer.`
  - endgame ラベル：`2028年、LATAM の共通インフラを protocol として発行する。`｜en `In 2028, we issue Latin America's shared infrastructure as a protocol.`
- **motion**：bento＝Sierra「静止画が自走する」（レシートが CIF→II→合計を集計、物流が集荷→通関→配送をチェック、NF-e が「発行済」スタンプ）。統合図＝Sierra「dotグリッド上に浮く UI＋parallax」で Stripe の interactive 図を包む、2層スタックは上→下に組み上がり「価値は下層」を強調

### §3 ニュース（new）
- **役割**：勢い・thought leadership を機密数値なしで。**status: new**
- **layout**：H2＋sub＋横スクロール carousel（image＋見出し＋blurb＋link、`Item n of N` counter）
- **copy（草案）**
  - H2：`いま、Andes で起きていること。`｜en `What's happening at Andes.`
  - カード例：`2026年6月、越境ECをローンチ`／`IVS 京都に登壇`／`日韓×ブラジルの追い風`／`2028年、LATAM AC Protocol 構想`／`チームを募集中`
- **motion**：Stripe 横 carousel（drag/arrow＋counter）、header は Sierra 静かな fade-up。**カードに機密/先行/SKU 数値を出さない**

### §4 数字（new）
- **役割**：市場のデカさで**セラー勧誘**を動機づけ。**出口：販売を開始する**。**status: new**
- **layout**：Stripe「Backbone of global commerce」型。H2＋**4数字横並び**＋下に three-fluid-fx 流体（full-bleed）＋セラー CTA
- **copy（草案）**
  - H2：`ラテンアメリカという、巨大な市場。`｜en `Latin America is one vast market.`
  - 4数字（下表 [verified] から）
- **数字（4項目・確定）**

  | 表示 | caption (ja) | caption (en) | 年 | ソース |
  |---|---|---|---|---|
  | **6.6億人** | ラテンアメリカの人口 | Latin America population | 2024 | World Bank [verified 2026-05-29] |
  | **US$7,690億** | ラテンアメリカ EC 市場 | Latin America e-commerce | 2025 | PCMI [verified 2026-05-29] |
  | **2.1億人** | ブラジルの人口 | Brazil population | 2025 | IBGE [verified 2026-05-29] |
  | **1.7億人** | PIX 利用者（人口の80%） | PIX users (80% of pop.) | 2026 | Banco Central do Brasil [verified 2026-05-29] |

- **motion**：4数字は Stripe count-up（scroll 時）。下の **three-fluid-fx** マウス連動流体（Stripe dot-fountain を流体に）。**各数字を hover/押すと流体に色のさざ波が走る**。`prefers-reduced-motion` で静止画 fallback、Stripe 同様 play/pause。互換性のため **WebGL(GLSL) パス既定**（WebGPU 必須実装は不採用、[[design-stack]]）

### §5 採用（new）
- **役割**：2出口（セラー／採用）の合流。Stripe「Book of the week」的 culture signature。**status: new**
- **layout**：editorial ブロック（左＝image or 大型ステートメント／右＝見出し＋短文＋2リンク）→ 2枚扉
- **copy（草案）**
  - 見出し：`中南米経済の新しい基盤を、誰と建てるか。`｜en `Who do we build the new foundation of Latin America with?`
  - 本文：`Claude Code を当たり前に使う、少人数で巨大なインフラを建てるチーム。日本とブラジルをつなぐ仕事。`｜en `A small team building huge infrastructure, fluent in Claude Code. Work that connects Japan and Brazil.`
  - 2扉：`セラーとして売る`／`チームに参加する`｜en `Sell as a partner` / `Join the team`
- **motion**：ほぼ静（Stripe 静けさ）＋ Sierra 軽い fade-up

### FINAL CTA（new）
- **layout**：中央見出し＋1行＋2 CTA＋副カード2枚
- **copy（草案）**：`ラテンアメリカへ、売り始める。`｜en `Start selling into Latin America.`／sub `アカウントの相談から、事業提携まで。Andes がいちばん近い入口になる。`｜en `From a first conversation to a full partnership—Andes is your closest entry point.`／CTA `販売を開始する →`・`お問い合わせ`／副 `出店の流れを見る`・`Andes について知る`
- **motion**：Sierra restraint。accent solid CTA pill が**ここで初満開**

### FOOTER（new）
- **layout**：多列 link matrix（事業 / プラットフォーム / 会社 / 採用 / プレス / お問い合わせ窓口）＋ 言語(ja/en)＋ © ＋ 法人情報（Andes Inc. 東京 / Andes BR / J-Planet São Paulo, CNPJ 63.097.119/0001-44）。`docs/01` から引く
- **motion**：静、hover underline

---

## motion 設計（Sierra→Stripe 減衰）

1. **Hero(§1)＝純 Sierra**：full-bleed 動画 human moment＋自走 液体ガラス chat。Stripe の ticker 思想だけ scale 数字に足す
2. **bento(§2前半)＝Sierra「frozen-live micro-story」**：各タイルが自分の loop を再生（レシート集計／物流チェック／NF-e スタンプ）
3. **統合図(§2後半)＝Sierra「dotグリッド上に浮く UI＋parallax」**で Stripe interactive 図を包む
4. **ニュース(§3)・数字(§4)＝Stripe 構造＋Sierra 静か stagger fade-up**。数字下に three-fluid-fx
5. **採用(§5)〜footer＝Stripe 静けさへ減衰**。accent は Final CTA で初満開（Sierra が green を最後まで温存するのと同じ）

---

## ハードルール準拠チェック

- 日本語見出しは言い切り型、業界略語（AI / MCP / PIX / NF-e / II / ICMS / ERP / EC）と固有名詞・BR 制度名のみ英字
- public 数値は §4 の **外部マクロ4数字のみ**（すべて一次ソース＋年＋[verified]）。SKU / PRC唯一 / 24ヶ月先行 / Series A 数値は不掲載
- 「北極星」未使用（endgame＝「2028年、LATAM の共通インフラを protocol として発行」）
- 「中南米の王」→「中南米経済の新しい基盤を作る」、商社参考なし

---

## 実装メモ（component 単位）

| component | 操作 | 内容 |
|---|---|---|
| `HeroV4.tsx` | keep＋微追加 | scale strip（6.6億人 anchor）＋subhead/CTA fade-rise。chat 機構は触らない |
| `ServicesV4.tsx` | rework | 前半＝本物 product-surface bento に作り直し。後半＝統合図。ChatPreview 削除 |
| `NetworkV4.tsx` | 廃止→吸収 | ハブ&スポーク削除。dashed-flow 動きと2層 copy を §2 統合図へ移植 |
| `NewsV4.tsx` | new | 横スクロール carousel |
| `NumbersV4.tsx` | new | 4数字＋three-fluid-fx 流体。数値は本 doc 表＋`messages` から |
| `CareersV4.tsx` | new | culture signature＋2扉 |
| `FinalCtaV4.tsx` | new | 2 path CTA |
| `FooterV4.tsx` | new | sitemap＋法人情報（docs/01） |
| `page.tsx` | 組替え | Nav→§1→§2→§3→§4→§5→FinalCTA→Footer |
| `messages/{ja,en}.json` | new keys | 全 copy を key 化（3 locale ルールは ja/en 優先、pt-BR は後追い） |
| three-fluid-fx | 追加検証 | WebGL(GLSL) パス、`prefers-reduced-motion` fallback、play/pause |

> 数値の出典 raw は session の検証ワークフロー（一次ソース URL 付き）に記録済み。更新時は本 doc の [verified] 表を先に直す。
