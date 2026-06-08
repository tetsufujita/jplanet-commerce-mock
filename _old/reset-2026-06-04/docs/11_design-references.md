---
title: 11 デザイン参考ライブラリ（学習用・living）
updated: 2026-06-02
status: living（どんどん追記）
owner: Claude（設計学習）
note: 各サイトは fetch 実在確認済。「綺麗」でなく「盗める作法」を抽出
---

# 11 デザイン参考ライブラリ — 学習ノート

> 一流サイトを「何が優れ → Andes に転用できる学び」で集める、育てる学習帳。
> Andes レンズ: **Stripe 骨格 × Anthropic 声 × Sierra motion / 宣言型 hero / Crimson #C8102E は pin-point / 純抽象 / restrained premium（派手より上質）/ 紫グラデ slop は NG**。

## ★ まず頭に入れる「9 法則」（これが学びの核）

**配色・質感**
1. **accent は「面積」で殺す** — 一流ほど brand color を CTA と強調語だけに限定。色は足すほど安い。＝ Crimson pin-point が正解。
2. **premium は色でなく type と余白で出す** — size・weight・whitespace の差だけで上質を作る。装飾（紫グラデ）に逃げない＝引き算の設計。
3. **dark にするなら色でなくコントラストと陰影で奥行き** — vibrant 色を足さず gradient overlay / soft shadow（Retool / Linear）。

**没入・モーション**
4. **没入は「scale + 余白 + 段階開示」で作る。motion の量で作らない**（Apple / Linear）。scroll-jacking や全面 3D は制御を奪い restrained を壊す。
5. **強い効果は 1 箇所に絞る = pin-point**（magnetic cursor も流体も Crimson も「全面でなく要点」）。
6. **重い見た目でも性能と reduced-motion を死守**（Igloo は LCP≈1 秒・テクスチャ圧縮・`prefers-reduced-motion` fallback）。Lenis は reduced-motion を保証しないので自前で持つ。

**語り・コピー（見せ方）**
7. **hero は宣言、proof は具体数値** — 抽象主張は具体数字（before/after・巨大数・実名）で裏取り。Andes の 4 マクロ数字はこの型に乗せる。
8. **宣言の直後に地味な実装を併置する**（Anthropic: 影響の大きさ→リスク抑制 / Andes: 経済を作り替える→物流・税・法を一つずつ繋ぐ）。壮語は具体で着地。
9. **時間軸の壮大さは数字でなく対句で匂わせる**（Watershed「Insights today. Impact for generations.」）。$1T・100 年は数字で出さず「今日と世代」の対句に翻案。

---

## レンズ A: B2B / infra / AI / fintech 一流（型・余白・抑制）

| サイト | URL | 何が優れ → Andes の学び | タグ |
|---|---|---|---|
| **Stripe** | stripe.com | 結果先行の宣言 hero＋巨大 bold 数字＋小注釈の proof。accent は CTA だけ | #宣言型hero #色の抑制 #proof |
| **Linear** | linear.app | 色に頼らず size/weight だけで階層。事業を block 分割グリッド。proof は1強数値+実名 | #タイポ #グリッド #余白 |
| **Anthropic** | anthropic.com | mission 先行宣言。色を足さず権威。教育的・非攻撃トーン＝「Anthropic 声」原典 | #トーン #宣言型hero |
| **Sierra** | sierra.ai | 行分割の宣言文。text/image 交互レイアウトで section をリズム化＝「Sierra motion」原典 | #宣言型hero #余白 #proof |
| **Vercel** | vercel.com | proof を before/after 具体数値（build 7m→40s）。高コントラスト neutral+accent 最小 | #proof #色の抑制 |
| **Mercury** | mercury.com | fintech の信頼×モダン。青を CTA と強調だけに限定。press ロゴ+数値+引用を1束に | #色の抑制 #proof |
| **Retool** | retool.com | dark の正解＝色でなくコントラスト/陰影で premium。ロゴ monochrome 統一 | #ダークモード #色の抑制 |
| **Browserbase** | browserbase.com | agent 文脈の「能力宣言」hero。saturated 回避・青 accent を点で。生の巨大数字 | #宣言型hero #proof |

---

## レンズ B: シネマティック / 没入（restrained に効くものだけ）

| サイト | URL | 技法 → Andes の学び | タグ |
|---|---|---|---|
| **Apple（AirPods Pro）** | apple.com/airpods-pro | ★最重要手本。scroll-scrub の startframe→endframe、scale+余白+段階開示で支配。数字 reveal に転用 | #scroll-scrub #restrained #手本 |
| **Igloo Inc** | igloo.inc | 1 つの抽象オブジェクトに事業を内包→scroll で reveal。LCP≈1 秒死守。純抽象 IA に直結 | #WebGL #scroll #performance #手本 |
| **Obys** | obys.agency | 文字組み/グリッドが主役、WebGL は脇役。letter で没入＝宣言型 hero と一致 | #letter-motion #typography #手本 |
| **Lusion** | lusion.co | cursor 追従の流体（three-fluid-fx hero の手本）。ただし Andes は hero 局所に留める | #fluid #cursor #過剰注意 |
| **Active Theory** | activetheory.net | hover で隣を 2px ずらす rack focus（低コストで上質）。全面 3D は過剰の反面教師 | #micro-interaction #過剰注意 |
| **Cuberto** | cuberto.com | magnetic cursor（CTA 1 箇所だけ効かせる＝pin-point 同型）。skew まではやり過ぎ | #cursor #magnetic #遊びすぎ注意 |
| **Linear（再掲）** | linear.app | restrained premium tech の到達点。グロウ/グラデは「呼吸する radial」で奥行きだけ | #restrained #glow #手本 |
| **Unseen Studio** | unseen.co | letter-spacing の繊細 reveal だけ採る。ドラッグ探索 IA は学習コスト高で不要 | #letter-motion #過剰注意 |

> 反面教師: scroll-jacking（ユーザの scroll 制御を奪う）は宣言型 hero では逆効果。全面 3D 空間/マルチユーザ tube はコーポレートサイトで方向性を失う。

---

## レンズ C: 見せ方（語り・IA・コピーの型）★copy 実例付き

### Stripe — 「カテゴリ宣言 → 射程を広げる三段 → 数字で規模保証」
- hero「事業成長を支える金融インフラ。」/ sub「決済→組込み型金融→エージェンティックコマースまで」（射程を広げる三段）
- → Andes:「中南米に新しい経済の基盤を建てる」+ sub で射程三段。4 マクロ数字は「数字＋極短ラベル」4 枚並置。

### Anthropic — 「信条宣言 → but 節で謙虚さ」
- 「AI research and products that put safety at the frontier」/「…secure its benefits and mitigating its risks.」（恩恵を確かにし、リスクを抑える）
- → Andes: 壮語の直後に地味な実装を併置（経済を作り替える→物流・税・法を一つずつ繋ぐ）。

### Cloudflare — 「能力を動詞で言い切る → 2-3 語の体言ラベル」
- 「Zero Cold Starts」「Global by Default」/「330+ cities worldwide」
- → Andes: agent 抽象図のキャプションは 2-3 語の体言ラベル（翻案済）。「6.6億人/2.1億人」は地理カバレッジの信頼として。

### Sierra — 「Built on Sierra（前置詞句で基盤化）→ results 章 → 仕組み → CTA」
- hero「Better customer experiences. Built on Sierra.」/ 節「The results speak for themselves」
- → Andes: 「基盤を建てる」宣言と完全一致。section 順「宣言→数字章→仕組み図→CTA」を 9 section の背骨に。EC 証拠は results 章のように一章に隔離。

### Watershed — 「対句の短文で壮大さと品位を両立」
- hero「Insights today. Impact for generations.」（今日に洞察を。世代に影響を。）/「3.3 Gt CO₂e」（問題の総量）
- → Andes: 「[今/具体] と [世代/壮大]」の 2 文対句で 100 年スパンを数字を出さず匂わせる。

### Mercado Libre（IR）— 「地域 No.1 宣言 → 長期視点で短期不安を上書き」★最重要参照
- hero「The Leading Commerce and Fintech Ecosystem in Latin America」/「Our Long Term View in 5 Charts」/ EC 市場「$151B(2023)→$232B(2028)」
- → Andes: LatAm 市場規模の予測数字で機会を示す型。「US$7,690億」を成長トレンドの文脈に。「Long Term View」は 100 年スパンの上品な語彙。

### Nubank — 「包摂率でインパクトを定量化」
- 「135M customers」「62% of Brazilian adults」「28M people obtained their first credit card through Nu」/ mission「fight complexity and empower people」
- → Andes:「2.1億人/1.7億人」を規模でなく「これだけの人の経済基盤になる」意味に転化。mission は動詞 2 連の短句（例「障壁を取り除き、現地に力を」）。

### Ramp — 「定量証拠の密度で信頼」
- 「50,000+ businesses」「27.5M+ hours saved」「75% faster」「200+ countries」
- → Andes: 実績数字は薄いので自社実績でなく**マクロ市場数字**で密度を作る。「数字＋極短ラベル」のグリッド密度（4-6 枚）だけ採用。

---

## どんどん勉強し続けるための道具
- **lazyweb**（25.7万 UI 意味検索・導入済）: パターン名で実 UI スクショを引く（例「hero declarative b2b」「scroll storytelling」）。`reference_lazyweb-design-research` 参照。
- **既存スクショ**: `design/references/`（競合 9 枚）/ `design/screenshots/`（自社計測）。
- **firecrawl**: 気になったサイトを scrape して copy/構造を採取。
- **旧 design ノート（legacy・reset 前）**: `design/moodboard*.md` `design/storytelling-references.md` `design/stripe-shopify-patterns.md` — 参考だが本 doc が現行正典。

## 次の勉強候補（living・追記していく）
- 日本/ブラジルの一流コーポレート（現地トーンの参考）
- pricing / proof セクション専門の型集め
- フッター / ナビ / モバイルの見せ方
- award 受賞の「数字 reveal」アニメ実例（Apple scroll-scrub 系）

## 出典
- レンズ A/B/C 各リサーチ 2026-06-02（fetch 実在確認）。サイト URL は本文内。
- 関連: docs/09（アニメ素材）/ docs/04（色 lock）/ docs/07（homepage spec）/ memory `reference_design-references`
