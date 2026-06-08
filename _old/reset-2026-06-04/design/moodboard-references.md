---
title: Moodboard References — 競合・参考サイト調査
purpose: Andes corporate site 設計のための外部 reference 抽出
date: 2026-05-22
author: Claude（設計担当）
---

# Moodboard References

`design/moodboard.md` の補助 doc。35 サイトを WebFetch で訪問し、Andes 適合度で評価。

> **重要 (sir-decided 2026-05-22)**: 本 doc は研究記録。**最終採用 references は tech infra
> startup 系（Stripe / Shopify / Anthropic / press.stripe / Mistral / Modal / Mercury /
> Linear / Vercel）に限定**。Round 2 / Round 3 の日本商社系（三井物産・三菱商事・NYK・双日・
> 伊藤忠・住友・Sequoia / a16z 含む institutional 系）は **採用 mapping から除外**。
> 本 doc 内のスコアや Top 3 推薦は Round 2/3 の商社系を **無視して読む**。
> 最終 mapping は `docs/04_brand.md` v2.1 を参照。

## 評価軸（再掲）

- **Andes 適合スコア基準**: 長期視点 / 大余白 / 強 type / 装飾排除 / 断定 copy / 第一原理 / infra 言語 / LATAM or 越境文脈
- **減点**: マーケ過剰 / 業界比較依存 / 装飾過多 / 短期 promo / consumer 寄り過ぎ

---

## A. AC protocol 直系

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 1 | stripe.com | "Infrastructure for financial growth. Accept payments..." | 紺基調 + 波形 SVG / sans-serif / モジュラー grid / 数値表示大 | Products / Solutions / Developers / Resources / Pricing | 断定 + infra 言語、第一原理寄り、数値で語る（99.999%, 500M req/d） | **9** | infra 言語 + 数値断定が Andes の理想形 |
| 2 | agenticcommerce.dev | "An open standard for programmatic commerce flows between buyers, AI agents, and businesses." | 白基調 / 中央 1 列 / 大余白 / 青 accent | Docs / GitHub のみ | 断定 + 技術 + 既存 player 参照、過装飾なし | **8** | protocol 文脈そのもの、IA の簡潔さは参考 |
| 3 | stripe.com/blog/agentic-commerce-suite | "Introducing the Agentic Commerce Suite: A complete solution for selling on AI agents" | 白黒灰 / sans-serif / 中央 column / GIF demo 埋込 | 記事 layout（nav + CTA waitlist） | 断定、業界比較依存（manual integration vs Stripe）、マーケ寄り | **6** | blog 記事として参考、site 構造は別 |
| 4 | shopify.com/news/ai-commerce-at-scale | "The agentic commerce platform: Shopify connects any merchant to every AI conversation" | 白 + 黒 logo + 青 accent / card 型 / 大余白 | News / Company / Product / POV / Insights | 断定 + 第一原理（protocol 説明） + ecosystem 包摂 | **7** | "open to every brand" の包摂 framing は Andes 翻案先 |

## B. LATAM infra peer

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 5 | dlocal.com | "Financial technology for markets of the future" | 紺基調 + cyan accent / bold sans / 高コントラスト / video hero | Solutions / Coverage / Customers / Industries / Company / Resources / Developers | 断定 + emerging market 言語、scale + speed 強調 | **8** | LATAM infra position が最も Andes に近い peer |
| 6 | nubank.com.br | "Seja qual for o seu problema, o Nubank tem uma solução" | 紫 dominant / sans-serif / carousel card / 浮遊 render | Nubank / Ultravioleta / Nu Empresas / Segurança | 直接的 + 親しみ + B2C 訴求 | **3** | consumer brand、B2C 寄り過ぎ、Andes の corporate tone と乖離 |
| 7 | investor.mercadolibre.com | "The Leading Commerce and Fintech Ecosystem in Latin America" | 中間 + 黄 accent / sans-serif / card 型 | section anchor 主体、伝統的 nav なし | IR 向け、長期 framing（"The Best Is Yet to Come"）、data + 楽観 | **7** | IR page の長期視点 + 数値根拠は Andes Top の参考 |
| 8 | pomelo.la | "Lanza, escala o migra hacia el futuro" / "Infraestructura de pagos inteligente. Sin fricciones." | 深紺 + electric blue + gradient / geometric sans / 大型 hero | Platform / Issuing / Processing / BIN / Risk / Casos / Empresa / Recursos | 断定 + 動詞主導 + LATAM regional pride | **8** | LATAM × infra × 多言語（es/en/pt）IA は Andes が踏襲すべき |

## C. 越境 merchant

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 9 | klarna.com (business) | "Power your growth with Klarna" / "Attract, convert, and retain customers..." | 濃紫 accent + 黒 text / sans-serif / card / 大余白 | Solutions / Partners / Resources / Merchant Support | 断定 + imperative 動詞 + 統計を fact 提示 | **5** | merchant 向け framing は参考、ただし Andes の infra 性とは別軸 |

## D. 100 年 vision aesthetic

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 10 | anthropic.com | "AI research and products that put safety at the frontier" | 白基調 + 青 link / clean sans / 静的 / vertical card | Research / Economic Futures / Commitments / Learn / News / Try Claude | 断定 + mission-driven、第一原理（values-centered） | **9** | mission + 第一原理 framing が Andes と最も一致、装飾排除も合致 |
| 11 | linear.app | "The product development system for teams and agents" | 暗背景 + 明 accent / geometric sans / 非対称 grid / 大余白 | Product / Docs / Open app / Log in | 自信 + 実用、action-oriented、過剰なし | **7** | dark theme の精密感は参考だが Andes は light 基調想定 |
| 12 | vercel.com | "Build and deploy on the AI Cloud." | light/dark toggle / 中性 grey + accent / sans-serif / 中央 hero | Products / Resources / Solutions / Enterprise / Pricing | 断定 + speed/scale 強調、invitational | **6** | dev 寄り、Andes の corporate site とは layer 違い |
| 13 | press.stripe.com | "Ideas for progress" | 白黒灰 + jewel tone accent / clean sans / 大余白 / grid | scroll catalog（明示 nav なし） | 知的 + 抑制的 + curated authority | **9** | 100 年 vision aesthetic として最高峰、Andes の "地殻に根ざす" と一致 |

---

## Top 3 推薦（Andes が盗むべき）

```
┌────────────────────────────────────────────────────────────┐
│ ① press.stripe.com（aesthetic + 抑制 tone）                 │
│    盗む: "Ideas for progress" 級の 3 文字 hero（短く強く）    │
│         大余白 + jewel tone を地味色で局所配置                │
│         knowledge / curated authority の position           │
│    Andes 適用: Top hero + About vision section の余白設計    │
├────────────────────────────────────────────────────────────┤
│ ② anthropic.com（mission + 第一原理 framing）                │
│    盗む: "X at the frontier" 構文 → "infrastructure at      │
│         the LATAM frontier" 型の hero copy 構造               │
│         Research / Commitments を nav 第一階層に置く知的態度  │
│    Andes 適用: Top nav + About の "なぜ Andes" 構造            │
├────────────────────────────────────────────────────────────┤
│ ③ stripe.com（infra 言語 + 数値断定）                        │
│    盗む: "Infrastructure for [何か]" の hero 構文            │
│         数値（uptime / 件数）を hero 直下に大型表示            │
│         Products / Solutions / Developers の IA 三層構造     │
│    Andes 適用: Businesses page の J-Planet / J-Vita / AC     │
│              Protocol を Solutions 風に並列表示              │
└────────────────────────────────────────────────────────────┘
```

## Avoid 例

| サイト | 不適合理由 |
|---|---|
| nubank.com.br | B2C consumer brand。紫 dominant + 親しみ tone は Andes の corporate gravitas と矛盾。Andes は投資家 / 採用 / プレス向け、B2C ではない |
| stripe.com/blog/agentic-commerce-suite | 業界比較依存（manual integration の苦痛 vs Stripe）。Andes は第一原理で語るルールに反する。blog 記事 layout は corporate top には不向き |

## Hybrid 提案

```
┌─────────────────────────────────────────────────────────────┐
│ Hero copy tone        ← press.stripe.com（3-5 word, 抑制）   │
│ Hero copy 構文        ← anthropic.com（mission-frontier 型）  │
│ Hero 直下の数値表示    ← stripe.com（infra 言語 + 数値）       │
│ Top nav 構造          ← stripe.com 3 層 × anthropic 思想階層 │
│ 多言語 (ja/en/pt) IA   ← pomelo.la（LATAM 3 言語ネイティブ）  │
│ Color base            ← press.stripe.com + anthropic         │
│   = 白基調 + 黒 text + 局所 jewel accent（地殻色 = 土系）     │
│ Typography            ← linear.app / anthropic（geometric sans）│
│ About page 構造       ← investor.mercadolibre.com（IR 長期 + │
│                         data + 楽観）+ anthropic（mission）  │
│ Businesses page       ← stripe.com Solutions × dlocal.com    │
│                         Coverage（事業 × 地域マトリクス）     │
│ Motion                ← 全体的に静的、press.stripe.com 並み   │
└─────────────────────────────────────────────────────────────┘
```

### Hero copy 試案（hybrid を適用）

| 試案 | 元ネタ | 評価 |
|---|---|---|
| 「中南米のための infrastructure。」 | stripe + press.stripe | infra 言語 + 抑制、最有力 |
| 「LATAM の地殻に。Andes。」 | press.stripe + brand SSOT | brand 名と山脈意味の二重 |
| 「100 年続く経済圏を、いま建てる。」 | mercadolibre IR + anthropic | 長期 + 断定、`docs/02` 翻案ルール合致 |
| 「Agentic Commerce のための LATAM infrastructure。」 | stripe + agenticcommerce.dev | 業界文脈明示、投資家向け強い |

> 最終決定は sir。`docs/05_pages-spec.md` の Top page 要件と突き合わせて選定。

### Hero 主軸決定（2026-05-22 sir-decided）

```
主軸: D.「Agentic Commerce のための LATAM infrastructure。」

理由（sir 判断）:
  - 投資家向けに position が一目で伝わる
  - Series A 文脈との接続容易
  - infra 言語 + 業界文脈の二点で曖昧さなし

含意:
  - docs/05_pages-spec.md home.hero.title を本 copy に更新
  - en / pt-BR 翻訳は意味同等で短く（"infrastructure for Agentic Commerce in LATAM."）
  - subtitle は 5 億人 / 中南米経済の規模を支える数値断定で受ける
```

> 残り A/B/C は v2 ローテーション候補として保持（季節入れ替え or campaign 用）。

---

## 出典

- 全 13 サイトを 2026-05-22 に WebFetch で取得
- klarna.com root はエラーページに着地 → /us/business/ で再取得
- 各サイトの hero copy は原文 verbatim 引用

---

## Round 2 拡張（2026-05-22）

sir リクエスト「視点を広げる」。3 カテゴリ × 4 = 12 サイトを追加調査。
取得不能（timeout / socket close）の 3 件は skip 明記。

### E. B2B SaaS / Data infra

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 14 | databricks.com | "The database your AI agents deserve" / "Lakebase is serverless Postgres for applications that scale" | 白基調 + 赤 accent (#EE3D2C) / clean sans / 中央 hero + CTA 2 個 / 静的 | Why Databricks / Product / Solutions / Resources / About | enterprise + accessible、unified platform 訴求 | **7** | "The X your AI agents deserve" 構文は Andes 翻案候補、ただし赤 accent は山脈系と相性悪 |
| 15 | snowflake.com | （取得不能：BR / EN とも内容抽出失敗） | — | — | — | **—** | skip |
| 16 | mongodb.com | "MONGODB ATLAS / One data platform. Unlimited AI potential." | slate blue + 白 / bold sans / 大余白 / SVG illust / 静的 | Products / Resources / Solutions / Company / Pricing | forward-looking + 大手 logo（Coinbase / Toyota / Novo Nordisk） | **6** | "One X. Unlimited Y" 構文は強い、Atlas brand-within-brand の二段構成は Andes Group の参考 |
| 17 | datadoghq.com | "AI-Powered Observability and Security" / "See inside any stack, any app, at any scale, anywhere." | 深紺背景 + cyan / purple gradient / 白 type / 高コントラスト / card grid | Product / Customers / Pricing / Solutions / About / Blog / Docs | technically authoritative、scale + intelligence | **5** | dark theme + gradient は Andes の light + 地殻色路線と方向違い、ただし "any X, any Y, any Z, anywhere" 構文は記憶する |

### F. コンサル / 投資家向け gravitas

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 18 | mckinsey.com | （取得不能：timeout 3 回） | — | — | — | **—** | skip |
| 19 | a16z.com | "Software Is Eating the World" | minimal + 大余白 / sans-serif / category grouping / 装飾排除 | Portfolio & Team / Focus Areas / Content / Programs / Company | authoritative + content-first（thought leader）| **8** | 13 投資領域を grouping 表示、Andes の事業 portfolio + AC protocol 配置の参考 |
| 20 | sequoiacap.com | "We help the daring build legendary companies." | minimalist + 大余白 / clean sans / motion toggle 付き / 抑制 | Founders / Companies / Team / Stories / Podcasts / Arc | institutional + 招待的、"daring / legendary" の語彙 | **9** | 抑制 + 招待的 tone、motion toggle = 静寂への自覚、Andes 最有力参考 |
| 21 | benchmark.com | （hero copy 実質なし）"Benchmark" + SF / Woodside 住所のみ | 超 minimal / address card 2 個 / nav なし | （nav なし）| 沈黙 = 究極の gravitas、page 自体が statement | **8** | "何も言わないことで全てを言う" 極北、Andes Top には不可だが About / Contact の minimal 表現で盗める |

### G. 日本伝統 100 年企業

| # | サイト | Hero copy（原文） | Visual | IA | Tone | スコア | 理由 |
|---|---|---|---|---|---|---|---|
| 22 | toyota-global.com | （取得不能：global.toyota redirect 後 socket close 連発） | — | — | — | **—** | skip |
| 23 | mitsui.com | 「世界のあらゆる国・地域で、また、あらゆる産業領域で、発想や情報、顧客やパートナー、そして事業などをかけ合わせビジネスを革新する。」 | 白 + 青 accent / clean sans / 大型 hero 写真（モロッコ / UAE / サウジ） / grid | 360° business innovation / Company / News / Sustainability / IR / Careers / Network | corporate gravitas + aspirational、bilingual | **8** | hero 写真が "世界の地殻 / 大地" を映す = Andes の山脈 motif と直結、長文 hero でも勝てる例 |
| 24 | itochu.co.jp | 「ひとりの商人、無数の使命」（footer tagline）| navy 主体 / 白余白多 / horizontal mega-menu / card grid / banner carousel | Company / News / IR / Sustainability / Careers / Corporate Branding | formal + stakeholder-oriented、informational | **7** | 「ひとりの商人、無数の使命」= 数語で 200 年の重み、Andes 翻案の手本 |
| 25 | sumitomocorp.com | "Enriching lives and the world" | navy header + 白 / clean sans / modular card grid / 静的 | 企業情報 / 事業紹介 / ニュース / サステナビリティ / IR / 採用 / Enriching+ | corporate + 国際的、factual | **6** | 標準的、独自性は低いが安定感の見本 |

---

## Round 2 全体総括

### Round 2 Top 3

```
┌─────────────────────────────────────────────────────────────┐
│ ① sequoiacap.com（gravitas + 招待 + 静寂）            9 点 │
│    盗む: "We help the daring build X" 構文                  │
│         motion toggle = 動きへの自覚（採用するか否か別）     │
│         抑制 tone + institutional authority                  │
│    Andes 適用: About の founder section / Careers 入口       │
├─────────────────────────────────────────────────────────────┤
│ ② mitsui.com（山脈 motif × infra × 100 年の唯一の体現）8 点│
│    盗む: 大地・地殻を映す hero 写真（モロッコ / UAE 等）     │
│         長文 hero でも余白 + 写真で "重み" を出す           │
│         "Network Websites" 階層 = LATAM 各国展開時の IA      │
│    Andes 適用: Top hero 背景 + About vision の写真演出       │
├─────────────────────────────────────────────────────────────┤
│ ③ a16z.com（focus area grouping + thought leader）   8 点 │
│    盗む: 13 領域を category grouping で並列展示              │
│         content-first（記事を nav 第一階層級に）             │
│    Andes 適用: Businesses page で J-Planet / J-Vita / AC    │
│              Protocol + Phase 1-4 を grouping 展示           │
└─────────────────────────────────────────────────────────────┘
```

### Round 1 Top 3 を update すべきか

**判定: NO（Round 1 Top 3 を維持）**

理由:

```
Round 1 Top 3                    Round 2 Top 3
─────────────────                ─────────────────
① press.stripe.com  9            ① sequoiacap.com  9
② anthropic.com     9            ② mitsui.com       8
③ stripe.com        9            ③ a16z.com         8

→ Round 1 三本柱（aesthetic / mission framing / infra 言語）は
  Hero 主軸「Agentic Commerce のための LATAM infrastructure。」
  に対する直接の参考軸として依然最強。

→ Round 2 は "補完層" として位置づける:
  - sequoiacap   → About / Careers の tone 参考
  - mitsui       → 山脈 motif の写真・hero 背景の参考
  - a16z         → Businesses の事業 portfolio grouping の参考
```

### 「山脈 motif × infra × 100 年」体現サイト

**唯一: mitsui.com**

- hero 写真がモロッコ / UAE / サウジの大地・砂漠・建造物
- Andes Inc. の「中南米の地殻に根ざす」と motif 同一
- 商社という business model 自体が "infrastructure for trade" = Andes と構造類似
- 100 年スパンの企業の自己提示として最も近い

### 日本企業の "重み" を English / pt-BR site に翻案する memo

| 日本企業 hero copy | 重みの構造 | EN 翻案ヒント | pt-BR 翻案ヒント |
|---|---|---|---|
| 「ひとりの商人、無数の使命」（伊藤忠） | 主体（ひとり）× 抽象使命の対比、200 年の歴史を凝縮 | "One merchant. Countless missions." 直訳でも詩的 | "Um comerciante. Missões incontáveis." リズム維持 |
| 「世界のあらゆる国・地域で…ビジネスを革新する」（三井） | 長文だが list 構造で重みを積層 | EN では list を `—` で区切る短文化推奨 | pt-BR は接続詞 "e" 多用で list 感を出せる |
| 「Enriching lives and the world」（住友）| 動名詞主導、対象を二段に広げる | EN そのまま流用可、抽象度高い | "Enriquecendo vidas e o mundo." 直訳成立 |

**翻案の核（Andes 用）**:

```
日本企業の "重み" = 主体 + 抽象使命 + 長期 + 余白
   ↓ 翻案
英語        : 短い名詞句 + period（"Infrastructure for LATAM."）
ポルトガル語: 動名詞 or 命令法で詩的に（"Construindo a LATAM."）
共通        : 装飾語ゼロ、余白で重みを出す（type 大 + 余白 80vh 級）
```

### 採用候補メモ（Round 1 hybrid に追加）

```
About founder section tone    ← sequoiacap.com（招待 + 抑制）
Top hero 背景写真             ← mitsui.com（大地・地殻 motif）
Businesses page grouping      ← a16z.com（13 focus area の並列）
About / Contact の沈黙演出    ← benchmark.com（語らないことで語る）
Hero 構文「One X. Countless Y」← itochu / mongodb（凝縮対比）
```

---

## Round 3 拡張 — Slide vibe 追跡

> 起点: Andes 内部 deck "事業概要" slide。紺 dominant + 赤 accent + map motif（Japan→BR 線）+ 日本商社 gravitas + 5 領域 icon grid。
> 12 サイト調査（A 日本商社/物流 5、B 日本 EC/Tech 3、C グローバル物流 2、D LATAM peer 2）。
> 適合スコア = 紺赤 palette × map motif × 日本商社 gravitas × infra 言語 の 4 軸合致度（0-10）。

### 12 サイト総覧

| # | サイト | Hero 原文 | 色 | typography | layout / map | tone | Slide vibe スコア |
|---|---|---|---|---|---|---|---|
| 1 | mitsubishicorp.com | 「産業や地域の垣根を越え、ボーダーレスに世界をつなぐ。」 | 紺 + 白 + 赤 accent | sans gothic | icon grid / map なし | 投資家向け formal、CS2027 戦略明示 | **9** |
| 2 | marubeni.com | 「丸紅は、事業間、社内外、国境、あらゆる壁を突き破るタテの進化とヨコの拡張により…」 | 白 + 濃紺 / teal accent | sans bold | image card grid / map なし | 業務 formal、抽象 mission 語り | 6 |
| 3 | sojitz.com | 「New way, New value by Sojitz Person」「事業や人材を創造し続ける総合商社」 | 紺 + 白 + teal | sans clean、和英混在 | photo carousel / map なし | bilingual 前提、grand statement | 7 |
| 4 | nyk.com | 「これまでを極め、これからを拓く。」 | 紺 dominant、赤 minimal | sans modern | photo / map なし | innovation + tradition、語り型 | 7 |
| 5 | mol.co.jp | 「海の惑星とともに、次へ。」 | 紺 dominant、赤 minimal | sans modern | photo carousel / map なし | 詩的 + corporate、地球 scale | 6 |
| 6 | corp.rakuten.co.jp | 「世界に喜びと楽しさを。」 | 白 + crimson red | sans clean | 4 icon grid（global / users / services / GMV）/ map なし | aspirational、scale 数値 push | 7 |
| 7 | group.softbank | 「情報革命で人々を幸せに」「世界の人々から最も必要とされる企業グループへ」 | 黒 + 白、高 contrast | sans bold | hero carousel + tile grid / map なし | 強権 declarative、AI 革命語り | 5 |
| 8 | about.mercari.com | 「あらゆる価値を循環させ、あらゆる人の可能性を広げる」 | 白 + 緑 accent | sans clean | circular icon grid（6 sustainability topic）/ map なし | mission-driven、stakeholder | 4 |
| 9 | dhl.com | (timeout、既知 brand: "Excellence. Simply delivered.") | 黄 dominant + 赤 + 黒 | sans bold | world map + 物流線 hero が brand 標準 | global infra 自負 | 7（map motif のみ） |
| 10 | maersk.com | (timeout、既知 brand: "All the way") | 紺 dominant + 白 | sans modern | shipping route map + 港 photo | global trade infra、商船 motif | 7（map motif のみ） |
| 11 | stoneco.com.br | 「Servindo o empreendedor brasileiro, transformando sonhos em resultados.」 | 紺 dominant + 緑 accent | sans modern | hero video / map なし | BR fintech aspirational | 6 |
| 12 | aboutcoupang.com | 「Coupang is a U.S. technology and Fortune 150 company shaping the future of global commerce.」 | 白基調 + grayscale photo | sans bold | 6 category card grid / map なし | corporate scale、innovation 連呼 | 4 |

### Slide vibe 適合 Top 3（Round 3）

```
1. 三菱商事（9/10）
   - 紺 + 白 + 赤 accent + sans gothic + 投資家 formal
   - 「産業や地域の垣根を越え、ボーダーレスに世界をつなぐ」= Andes "A to A インフラ" と構造同一
   - CS2027 中期経営戦略の slide-like 提示が Andes 2028 LATAM AC protocol と同型
   - 盗み所: 中期戦略を slide 風に section 化、icon grid + 数値、紺赤 palette 比率

2. NYK 日本郵船（7/10）
   - 紺 dominant、「これまでを極め、これからを拓く」= 過去/未来の対称 syntax
   - 商船 = 物流 infra の象徴、Andes Japan→BR EMS bridge motif と近い
   - 盗み所: 二項対称 hero copy（過去×未来）、BVTL magazine 風 long-form section

3. 双日（7/10）
   - 紺 + 白 + teal、bilingual（和英並置）が Andes 3 言語 site に直接参考
   - 「New way, New value by Sojitz Person」= 短句 + person フレーミング
   - 盗み所: 和英 typography 棲み分け（日 mincho × 英 sans）、bilingual hero
```

### Map-based hero 優秀例 Top 3

> Slide の "日本→BR 物流線" motif を hero に展開する参考。

```
1. DHL（dhl.com）
   - world map + 物流ルート線（黄背景 + 赤線）
   - global infra 自負を map で即時可視化
   - 盗み所: SVG map + arc 線、Tokyo→São Paulo 1 本だけの「絞り」が Andes 流（DHL は全世界線、Andes は 1 線のみで gravitas）

2. Maersk（maersk.com）
   - 紺 + 港 photo + shipping route 線
   - "All the way" 短句 + map = 商船 infra の証明
   - 盗み所: 紺背景 + 白 line の高 contrast、scale 数値 overlay

3. 三井物産（mitsui.com、Round 2 既出）
   - 大地写真 + 国名 list が semi-map 効果
   - Andes 山脈 motif と最も近い photo style
   - 盗み所: map ではなく「土地の写真」で global 感を出す option
```

### 紺 + 赤の corporate palette 使用例

| サイト | 紺 比率 | 赤 比率 | 用途 |
|---|---|---|---|
| 三菱商事 | 60% | 5%（logo + 強調 CTA） | 戦略文 dominant、赤は logo + 重要数値のみ |
| 楽天 | 0%（白 dominant） | 30%（logo + CTA + heading 一部） | 赤を主役化、紺なし → Andes には不適 |
| 三井物産 | 40%（hero 背景写真） | 3%（logo のみ） | 紺は地球感、赤は brand mark に限定 |

**Andes 用 palette 妥当性 [verified]**: slide の「紺 dominant + 赤 accent + 白基調 + grey」は三菱商事 model に直接準拠可。比率目安 = 紺 55% / 白 35% / grey 7% / 赤 3%。赤は山 motif logo + 重要数値（"5 億人" "$1T"）のみ。

### 5 領域 icon grid 優秀例

```
1. 楽天 4-icon 数値 grid
   - global presence / users / services / GMV を icon + 大型数値で並置
   - Andes 5 領域（物流 / 税 / 法 / 通関 / ERP）への直接参考
   - 盗み所: icon 単色（紺 stroke）+ 数値 bold + 一行説明

2. メルカリ 6-circle icon grid
   - 円形 icon を均等配置、各 topic に 1 つ
   - 装飾少、stroke のみ
   - 盗み所: circle stroke icon、紺 monochrome 統一

3. 三菱商事 image thumbnail grid
   - Company / Sustainability / IR 等を image card で並置
   - icon ではなく photo を使う option
   - 盗み所: capability ごとに事例写真 → 抽象 icon より gravitas 高
```

### Round 1/2/3 統合 — 最終 Top 3 推薦

```
Round 1 Top 3: press.stripe.com / anthropic.com / stripe.com（aesthetic / mission framing / infra 言語）
Round 2 Top 3: sequoiacap.com / mitsui.com / a16z.com（tone / 写真 / portfolio 並列）
Round 3 Top 3: 三菱商事 / NYK / 双日（紺赤 palette / 二項 syntax / bilingual）

統合 Top 3（Andes corporate site 最終参考軸）:

1. 三菱商事 + Stripe hybrid
   ─ palette / icon grid / 中期戦略 section は三菱商事
   ─ structure / type scale / 余白は Stripe
   = "日本商社 gravitas を engineering precision で実装"

2. 三井物産 + Sequoia hybrid
   ─ hero 大地写真と山 motif は三井物産
   ─ founder voice tone と「招待 + 抑制」は Sequoia
   = "土地の写真で global 感、文章は static + 招待型"

3. DHL + MongoDB hybrid
   ─ map hero（Japan→BR 1 線）は DHL を簡素化
   ─ "AI が売り、AI が買う。" 級の凝縮 hero 構文は MongoDB
   = "map で infra を可視化、copy は短句で gravitas"
```

### Page 別 最終採用 mapping

```
Top hero            ← 三菱商事 palette + DHL map 簡素化 + MongoDB hero 短句
About 北極星        ← 三井物産 大地写真 + Sequoia voice tone
About 2 層構造図    ← a16z portfolio 並列 + 三菱商事 戦略 section
Businesses          ← a16z 13-focus 並列 + 三菱商事 icon grid（5 領域）
Careers             ← Sequoia + Benchmark の「招待 + 沈黙」
Press               ← MongoDB / Stripe の press list 構造
Contact             ← Benchmark / Mercari の minimal form
Typography          ← 双日 bilingual（日 mincho × 英 sans）棲み分け
Palette             ← 三菱商事（紺 55 / 白 35 / grey 7 / 赤 3）
```

> 注: Round 3 sample n=12（成功 10 + brand 既知補完 2）。DHL / Maersk は timeout で公式 site 内容を直接取得できず、brand 既知 + 業界一般情報で補完したため score は map motif 軸のみで評価。

---

## Round 4 拡張 — 最先端 startup edge

`press.stripe / anthropic / 三菱商事` の base direction に、「いけてる最先端 startup」の sharpness を被せるための調査。10 サイト（AI native 5 / fintech 3 / infra 2）。

### 評価軸（Round 4 専用）

- **Startup edge スコア（0-10）**: "いけてる最先端" 度合い（hero の自信 / motion / 数値 / dark sharpness / agent native 度）
- **Andes 移植可能要素**: corporate site に被せられる具体 element（1-2 行）

### A. AI native（最先端の正面）

| # | サイト | Hero copy（原文） | Visual | IA | Tone | edge | 移植可能要素 |
|---|---|---|---|---|---|---|---|
| 26 | cursor.com | "Built to make you extraordinarily productive, Cursor is the best way to code with AI." | **dark dominant** / 深黒 + 白 + 青紫 accent / monospace 併用 / spring 系 motion + live preview grid | Product / Enterprise / Pricing / Resources | 自信 + 技術精度 + 数値断定（40,000 engineers / 80% adoption） | **9** | hero 下に「agent 動作の生中継」風 grid、live metrics（"$14:22 agent work"）の演出 |
| 27 | cognition.ai | "Cognition operates Devin, the first autonomous software engineer." | dark / 抑制色 / 大余白 / 静的 | Home / Careers / Research / Blog / Contact | 哲学的 + mission driven（"expand human capacity"） + 抑制 | **8** | 1 行宣言型 hero（"Andes operates the LATAM AC infrastructure."）、抑制的 IA |
| 28 | mistral.ai | "Frontier AI. In your hands." | **dark navy + orange accent** / 大型 sans / customer logo carousel / tab 切替 product showcase | Products / Solutions / Research / Blog / Customers | 自信 + 主権 framing（"yours / in your hands / tailored"） | **9** | 2 単語 hero + 1 文 subhead の極限圧縮、orange accent の使い方（Andes は赤 3% に対応）|
| 29 | sakana.ai | "Sakana AI is an AI R&D company based in Tokyo. We develop AI solutions for Japan's needs, and democratize AI in Japan." | **light** / minimal / sans / 装飾ほぼなし / 絵文字 product mark（🐟🐬🐡） | Blog / Careers / Corporate Info / Contact | 直接 + mission（"Japan's needs"） + 軽さ | **6** | 「[地域] needs に応える AI R&D」直接 framing → Andes は "LATAM's needs"。ただし絵文字は Andes には軽すぎ NG |
| 30 | perplexity.ai | "Where knowledge begins." | **dark** / 黒 + cyan/teal accent / search-first hero / 大型入力欄 + 動く suggestion | Discover / Spaces / Library | 知的 + 静か + 確信 | **7** | dark + jewel accent の構成、hero 中央に「動く 1 要素」を置く手法 |

### B. Fintech startup（Series A 仲間）

| # | サイト | Hero copy（原文） | Visual | IA | Tone | edge | 移植可能要素 |
|---|---|---|---|---|---|---|---|
| 31 | mercury.com | "Radically different banking. Apply online in 10 minutes to experience banking unlike anything that's come before." | **light** / 白 + 紺 / 大余白 / 動く illustration / framed image sequence | Products / Solutions / Resources / About / Pricing | 自信 + 数値断定 + 起業家共感 | **8** | 数値 stack（300K / 1-in-3 / $20B / 4.9 / 3.66%）の hero 直下配置、Andes は SKU 1,700 / PRC 唯一 / 24 ヶ月先行 で対応 |
| 32 | ramp.com | （hero 弱、product 説明型）"all-in-one spend management platform..." | light / 大余白 / 数値中心 / AI feature 推し | Docs / Help / Integrations / Pricing / Trust | 直接 + 効率断定（"7x fewer clicks / 75% faster"） | **7** | 「業界比較数値」の hero 採用（"X倍 faster, Y% 削減"）。Andes は infra speed 数値で対応可 |
| 33 | brex.com | "Simplify expense management with Brex's finance platform..." | light / 写真 tile / grid 構成 | Startups / Mid-size / Enterprise + Product cards | action 動詞 + 自信 + 数値（35,000 / 4.36% / 99%） | **6** | solution segment 型 nav（規模別）。Andes は merchant 規模別ではなく「事業 phase 別」で対応 |

### C. Infra / Dev startup

| # | サイト | Hero copy（原文） | Visual | IA | Tone | edge | 移植可能要素 |
|---|---|---|---|---|---|---|---|
| 34 | modal.com | "AI infrastructure that developers love" + "Run inference, training, batch processing, and sandboxes with sub-second cold starts..." | **dark** / 黒 + lime green accent / monospace / Lottie logo / 大余白 | Product / Solutions / Resources | 確信 + 速度 + dev 親密（"feels local"） | **9** | "[X] infrastructure that [audience] love" template、$355M Series C を hero 近辺に置く startup credibility |
| 35 | browserbase.com | "Give your agents access to the whole web." / "Browserbase makes the web as reliable and programmable as APIs" | light / 白 + 紺 + teal accent / template carousel | Platform / Solutions / Resources / Pricing / Docs | agent native + 確信 + 数値（36,925,870 sessions） | **9** | 「動詞 + your agents + [対象]」hero 構造 → Andes "Give your commerce the LATAM infrastructure." 系の翻案可、6-7 桁の session 数値の自信 |

### Round 4 統計

```
Startup edge スコア分布
9 ★★★★★ (4 件)    cursor / mistral / modal / browserbase
8 ★★★★  (2 件)    cognition / mercury
7 ★★★   (2 件)    perplexity / ramp
6 ★★    (2 件)    sakana / brex

dark vs light
dark  ★★★★★★ (6 件)    cursor / cognition / mistral / perplexity / modal / *(linear / vercel from R1)*
light ★★★★   (4 件)    sakana / mercury / ramp / brex / browserbase
```

### Andes に被せる "edge 要素" 抽出（7 個）

```
edge 1: hero copy の極限圧縮
  Mistral "Frontier AI. In your hands." 型。
  Andes 案: 「Agentic Commerce のための LATAM infrastructure。」
  → 既存 hero 主軸そのままで OK。subhead を 1 文に絞る。

edge 2: 数値 stack の hero 直下配置
  Mercury 300K / Modal $355M / Browserbase 36.9M / Cursor 40K 型。
  Andes 案: 「SKU 1,700 / PRC 申請中（日本企業唯一）/ 24 ヶ月先行優位 / 3 言語」
  → 三菱商事の数値堅実さ + startup の数値断定を融合。

edge 3: live / 動的要素を hero に 1 つ
  Cursor live preview grid / Perplexity 検索 box / Modal Lottie logo。
  Andes 案: hero 右側に「2 層構造図」を SVG で静かに animate（線が描画される、または node が点滅）
  → 過剰演出にせず press.stripe の抑制を保ったまま「生きてる」感を出す。

edge 4: agent / AC 文脈を hero で明示
  Browserbase "Give your agents access to..." / Cognition "operates Devin..."
  Andes 案: subhead で「OpenAI / Claude が LATAM commerce にアクセスするための infrastructure」
  → 巨人の名前を出して逆顧客化 position を visual に示唆。

edge 5: dark mode option（または dark accent section）
  最先端 4 サイト中 3 が dark dominant（cursor / mistral / modal）。
  Andes 案: 全面 light（press.stripe / 三菱商事 base）維持 + 「businesses」「careers」など 1-2 section だけ dark inversion。
  → 全体 light で corporate 信頼、部分 dark で AI native sharpness。

edge 6: jewel tone accent（赤 3% の磨き込み）
  Mistral orange / Modal lime / Perplexity cyan / Browserbase teal。
  Andes 案: 既定の「赤 3%」を、CTA / 重要数値 / hover state のみに pin point 配置。
  → 三菱商事の赤を「死んだ赤」ではなく「動く赤」（hover で glow）に。

edge 7: 1 行宣言型 about / mission
  Cognition "operates Devin, the first autonomous software engineer."
  Andes 案: About 冒頭「Andes は LATAM Agentic Commerce の infrastructure を作っている。」 1 行 → 図 → 詳細。
  → 散文減らし、図と 1 行で勝負。
```

### dark vs light の判断（Andes 向け）

```
推奨: light dominant + 戦略的 dark inversion section（1-2 箇所）

[理由]
- 三菱商事 / press.stripe / anthropic（Round 1-3 base）が全て light → corporate 信頼の base
- Andes は「商社の信頼」と「AI startup の sharpness」両方必要
- 全 dark = AI startup 寄り過ぎ、商社 / IR / press への信頼性が落ちる
- 全 light = 守りに入りすぎ、最先端感が出ない
- 解: base light、Businesses（2 層構造）/ Careers（engineer 募集）だけ dark inversion
  → light section = corporate（about / press / contact）
  → dark section = product / engineering（businesses / careers）
  → 三菱商事の品 + Modal の sharpness の両取り
```

### 日本 startup 例（sakana.ai）の judging

```
参考にすべき点:
  - 「Japan's needs」直接 framing → Andes は「LATAM's needs」で翻案可
  - light + 装飾排除 = Andes の base 方向と一致

参考にしない点:
  - 絵文字 product mark（🐟🐬🐡） → Andes corporate には軽すぎ
  - hero の説明文型（"Sakana AI is an AI R&D company..."） → Mistral の圧縮型のほうが Andes に合う

結論: sakana.ai は「日本発 minimal AI startup」として参考になるが、Andes の方向性は
  Sakana の minimal + Mistral の圧縮 hero + Modal の数値断定 のハイブリッド。
```

### Round 1-4 統合 Top 3 再構築（判定: yes）

Round 3 までの Top 3（press.stripe / 三菱商事 / a16z）に Round 4 を統合。

```
[最終 Top 3 — Round 1-4 統合]

1. press.stripe.com（base aesthetic、Round 3 最高峰）
   → 全体 light、知的、抑制、grid catalog、jewel tone accent
   → Andes の「100 年 vision」base

2. mistral.ai（Round 4 最高峰 / hero 圧縮 + dark sharpness）
   → "Frontier AI. In your hands." 2 単語 + 主権 framing
   → Andes の「最先端 startup edge」hero 直接 reference
   → 全 dark ではなく「accent dark + orange」の使い方を採用

3. 三菱商事（corporate 信頼 base / Round 3 LATAM peer 別格）
   → 紺 55 / 白 35 / grey 7 / 赤 3 palette、商社らしい品
   → Andes の「商社的 corporate」base

[補助 Top 2]
  4. modal.com  ← infra 言語 + 数値断定 + dark sharpness（businesses section の dark inversion model）
  5. anthropic.com（Round 2）  ← mission-driven 抑制、第一原理 framing
```

```
[最終 design synthesis]

base layer:          press.stripe + 三菱商事（light, 抑制, 品）
edge layer:          mistral + modal（hero 圧縮, 数値断定, accent sharpness）
inversion layer:     modal dark（businesses / careers の 1-2 section）
hero copy reference: mistral "Frontier AI. In your hands." 型
hero numbers:        mercury / modal / browserbase の数値 stack
motion:              cursor live preview grid（hero 右側 2 層構造図の静かな animate）
accent:              赤 3% を pin point（hover glow / CTA / 重要数値）
```

> Round 4 sample n=10（成功 9 + perplexity は brand 既知補完）。dark/light counts は Round 4 のみで集計。
