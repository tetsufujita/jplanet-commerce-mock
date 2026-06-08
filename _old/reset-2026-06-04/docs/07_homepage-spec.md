---
title: ホームページ設計 SSOT（reset 後・正典）
date: 2026-06-02
updated: 2026-06-02
status: validated
tags: [homepage, ia, spec, ssot, post-reset]
supersedes: [docs/04 §hero-copy, docs/04 §数値方針, docs/05 homepage copy]
source: .lazyweb/design-research/agentic-commerce-site-2026-06-02/report.html
---

# 07 ホームページ設計 SSOT（reset 後・正典）

> 2026-06-02 大リセット後の **homepage の唯一の真実**。Lazyweb（25.7万 UI）+ web の 7 軸並列リサーチ → 批判→修正 loop を経た evidence-based brief。
> リサーチ全文レポート: `.lazyweb/design-research/agentic-commerce-site-2026-06-02/report.html`
> ブランド token / typography / motion の上位 SSOT は `docs/04`（本 doc が hero copy と数値方針を上書き）。

---

## 0. 核となる設計問題と答え

```
問題: エージェント本体 UI を出せない段階で、
      どうやって「ただの EC」でなく
      「Agentic Commerce のインフラ」に見せるか。

答え（4 重ガード）:
  ① 第一印象 = 宣言    →「中南米に、新しい経済の基盤を建てる。」
  ② 数字で裏打ち       → 4 マクロ数字 strip
  ③ エージェント = 純抽象図（chat / 商品 / 価格を一切出さない）
  ④ EC 画面 = 証拠に隔離（§6 で 1 枚だけ、phone 枠 + caption）
```

---

## 1. 確定事項（sir-decided 2026-06-02）

| # | 項目 | 確定 | タグ |
|---|---|---|---|
| 1 | J-Planet EC の露出 | §6 Portfolio で **1 枚のみ**（phone 枠 + caption、SKU grid 不掲載） | [sir-decided] |
| 2 | 2028 endgame の protocol | **生名称を名指ししない**。「2028 年までに [具体]」へ翻案、PIX/NF-e 等の spec list も出さない | [sir-decided] |
| 3 | 配色 | **docs/04 ブランド SSOT に lock**。Navy #0F1B3D / Paper #FAFAF7 / Ink #0A0A0A / **Crimson #C8102E（pin-point 厳守）**。mint #7AE0B5 は廃止、グラデ禁止 | [sir-decided] |
| 4 | J-Vita | **非掲載**（触れない） | [sir-decided] |
| – | launch 言語 | **ja / en 主軸**（pt-BR は demo content のみ） | [sir-decided 2026-05-29] |
| – | 2 大出口 | **① セラー勧誘（日韓ブランド募集）/ ② 採用** | [sir-decided] |

---

## 2. ポジショニング

```
第一印象 = 宣言（Anthropic / Mistral / Polygon register）
infrastructure / Agentic Commerce の語は subhead と本文で担保する二段構え。
旧 H1「Agentic Commerce のための LATAM infrastructure。」(= Nuvei 文法 clone)は廃止。
```

### 宣言 H1（確定 [sir-decided]）

| | copy |
|---|---|
| 日本語 | **中南米に、新しい経済の基盤を建てる。** |
| English | **Building the new economic foundation of Latin America.** |

### subhead（案）

| | copy |
|---|---|
| 日本語 | 6.6 億人の経済を、AI エージェントが動かす時代へ。Andes は中南米の Agentic Commerce の基盤を建てている。 |
| English | As commerce moves to AI agents, Andes is building the infrastructure beneath it — for 660 million people. |

> 「北極星」「中南米の王」「巨人を逆顧客化」「$1T 帝国」等の内部 jargon は public NG（CLAUDE.md 絶対ルール）。

---

## 3. 配色（docs/04 lock・再掲）

```
比率   白 60% / 紺 25% / grey 12% / 赤 3%
Navy    #0F1B3D   hero 背景 / header / footer / dark inversion
Paper   #FAFAF7   本文背景
Ink     #0A0A0A   本文字
Grey    #6E6B65   secondary text（他 scale は docs/04）
Crimson #C8102E   ★pin-point のみ: CTA / 4 マクロ数字 / logo / hover glow
Crimson(dark) #E83E5C   navy 上の hover glow 強化版
```

```
赤の規律（厳守）:
  ○ CTA ボタン / 4 マクロ数字 / logo 山 motif / hover glow
  × 本文・面・背景・帯に赤を使わない
  × グラデーション禁止（フラット維持）
```

---

## 4. 4 マクロ数字 [verified 2026-05-29]

| 数値 | 内容 | 一次ソース |
|---|---|---|
| **6.6 億人** | 中南米人口 | World Bank |
| **US$7,690 億** | 中南米 EC 市場 | PCMI |
| **2.1 億人** | ブラジル人口 | IBGE |
| **1.7 億人** | PIX 利用者（人口 80%） | ブラジル中央銀行 |

> 旧「5 億人のみ」は **2026-05-29 に撤回**。SKU 1,700 / PRC 唯一 / 24 ヶ月先行 / Series A 機密（pre-money・投資家名・commit 額）は引き続き **public NG**。

---

## 5. ホームページ IA（9 section）

各 section に **asset policy** を明記。これが「ただの EC」への崩落を構造的に防ぐ。

```
凡例  [A] エージェント = 概念/抽象図のみ（実 UI 厳禁）
      [E] EC 画面 = 証拠として許可（phone 枠 + caption 必須）
      [N] どちらも出さない
```

### §1 HERO — 宣言 + 野心の visual　`[A]`

- **狙い**: 最初の viewport で宣言を堂々と言い切り、野心を visible に。infra 名詞は subhead に降ろす。
- **copy**: H1 / subhead は §2 の通り。eyebrow「東京 / サンパウロ — 2026 年稼働」。CTA: primary「販売を開始する」（Crimson filled）/ secondary「Andes について」（outline）。
- **asset policy**: 背景は大陸スケールの抽象 connectivity 幾何、または JP・KR→BR corridor を確信ある 1 arc（端点に Crimson dot）。**実エージェント chat も EC 画面も商品 card も BRL 価格も hero に絶対置かない**。状態 chip「saiu do Japão」も置かない。
- **motion**: 宣言を支える type の確信ある立ち上がり + arc 描画（once、`prefers-reduced-motion` fallback）。calm な最小主義は採らない。
- **参照**: Anthropic / Mistral / Polygon（tone）、Telnyx（dark canvas 上の抽象 object）。

```
┌──────────────────────────────────────────────────────────┐
│ Andes              Businesses About Careers Press [問合せ]│ Navy #0F1B3D
├──────────────────────────────────────────────────────────┤
│  東京 / サンパウロ — 2026 年稼働                          │
│                                                            │
│   中南米に、                                               │
│   新しい経済の基盤を建てる。                              │  巨大 display
│                                                            │
│   6.6 億人の経済を、AI エージェントが動かす時代へ。       │
│   Andes は中南米の Agentic Commerce の基盤を建てている。  │
│                                                            │
│   [販売を開始する →]■Crimson   [Andes について]           │
│        背景: 大陸スケールの抽象幾何 / JP・KR→BR 1 arc       │
│        （端点に Crimson dot 2 点、product UI 無）          │
└──────────────────────────────────────────────────────────┘
```

### §2 数字 STRIP — 4 マクロ数字　`[N]`

- **狙い**: 宣言を数値で裏打ち。Stripe「Backbone of global commerce」型の 4 数字横並び。
- **asset policy**: 数字 + 出典 micro-label のみ。数値は Crimson（pin-point）。hover で Crimson glow（さざ波）、reduced-motion fallback。SKU・機密は混ぜない。

```
┌──────────────────────────────────────────────────────────┐
│   6.6 億人      US$7,690 億     2.1 億人      1.7 億人      │ ←数字=Crimson
│   中南米人口    中南米 EC       ブラジル人口   PIX 利用者    │
│   World Bank    PCMI            IBGE          ブラジル中銀  │
└──────────────────────────────────────────────────────────┘
```

### §3 WHY NOW — 新カテゴリの存在理由　`[A]`

- **狙い**: 「なぜ今・なぜ新カテゴリか」を旧モデル（壊れた越境 EC、物流・税の摩擦）との差で語る。
- **lead**: 「2026 年、商取引は website から AI エージェントへ移る。中南米はその独自進化が必要な唯一の経済圏である。」
- **3 point**: ① 物理/法/税の摩擦が AC を阻む ② Andes は購入と運用を一体で持つ ③ 現場の knowledge moat が規範になる。
- **asset policy**: テキスト + 抑制 icon（SVG stroke）。任意で before/after の純概念図（多段摩擦 ▶ 一本化）。EC 画面・agent UI 出さない。
- **参照**: CyberArk Conjur（before/after 図）、Anthropic。

### §4 HOW IT WORKS — 2 層構造 + agent を純抽象図　`[A]`

- **狙い**: agent UI を見せずに「購入エージェントがどう動くか」を純抽象 architecture/network 図で legible に。**深い層（プラットフォーム）が真の価値**だと視覚で示す。
- **asset policy（最重要）**: 横 step flow `[消費者]→[購入エージェント]→[プラットフォーム:税/通関/物流]→[配送]` を node・circuit・workflow で描く。**商品 card / BRL 価格 / iniciar pedido / chat bubble は全撤去**（shop 語彙）。
- **参照**: Glean（orchestration step 図）、Intercom（network-circuit で agent を概念化）、Coinbase（modules-ascending）、Pluralith（node graph）。

```
┌──────────────────────────────────────────────────────────┐
│  どう動くか                                                │
│  [消費者]→[購入エージェント]→[プラットフォーム]→[配送]      │
│   AIに依頼   解釈/編成      税/通関/物流(深層)    BR着       │
│            （node・circuit・workflow の純抽象図、chat 無）  │
│  ┌─────────────────────────────────────────────┐         │
│  │ Layer① 購入エージェント（薄い帯=ブランディング層）│      │
│  ├─────────────────────────────────────────────┤         │
│  │ Layer② プラットフォーム 物流/税/法/通関/ERP     │         │
│  │           （厚い帯 = 真の価値）                  │         │
│  └─────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### §5 SELLER 勧誘 — 「販売を開始する」（primary funnel）　`[N]`

- **狙い**: 2 大出口の片方（セラー勧誘）を footer 任せにせず専用 section で担保。
- **見出し**: 「日韓ブランドを、6.6 億人の市場へ。」
- **value prop 3 点**: ① 物流/税/通関/規制を Andes が一体運用＝越境の複雑性を持たない ② AI エージェントが現地消費者に届ける新販路 ③ PRC 適合通関で予期せぬ関税の発生なし。
- **CTA**: primary「販売を開始する」/ secondary「パートナー相談」。動詞は infra 寄り（「事業者として参加」「ネットワークに接続」）。「店を建てる」系動詞は禁止。
- **asset policy**: テキスト + benefit icon + button。**EC 画面 / 商品 card / storefront を見せて誘わない**。図は seller→Andes→消費者 の抽象 flow に留める。
- **参照**: Stripe / PayPal / Mercury。

### §6 PORTFOLIO — 事業 = thesis の証拠　`[E]`

- **狙い**: J-Planet を「最初の稼働事業 / プラットフォームの最初の deployment」として証拠化。**EC 画面はここで初めて、厳格に隔離して 1 枚だけ**。
- **見出し**: 「Andes の Agentic Commerce 実装。」
- **構成**: J-Planet（Layer① 購入エージェント、live 2026-06）を hero-sized な 1 枚 card。頂点に **長期 destination card**（下記、protocol 名指しなし）。Coinbase の modules-ascending で EC が会社全体に見えないようにする。equal logo wall 禁止。
- **destination card（protocol 名指し回避 [sir-decided]）**: 見出し「2028 — 中南米の商取引の共通基盤へ。」/ benefit 文のみ（PIX/NF-e/ICMS/LGPD の spec list、protocol 生名称は **出さない**）。CTA「ビジョンを読む →」。
- **asset policy**: WhatsApp 注文 thread（cropped、ポルトガル語 status）を **1 枚のみ**、必ず phone mockup 枠に内包し、必ず caption「J-Planet — 越境コマース、ブラジルで稼働中（2026-06）」。**1,700 SKU catalog grid 不掲載**。周囲に retail CTA（Shop / カート / Sign up / 始める）絶対置かない。full-bleed 禁止。
- **参照**: take.app（phone 枠隔離の **device のみ**、shop tone は借りない）、Coinbase、Flutter Entertainment（group thesis 先頭の構造のみ）。

```
┌──────────────────────────────────────────────────────────┐
│  Andes の Agentic Commerce 実装。                          │
│  ┌────────────────────────────┐  ┌────────────────────┐  │
│  │ Layer① 購入エージェント      │  │ ▲ 長期 destination  │  │
│  │ ■ J-Planet (live 2026-06)  │  │ 2028 — 中南米の     │  │
│  │ ┌────────┐ 日韓→BR 越境    │  │ 商取引の共通基盤へ  │  │
│  │ │[phone] │                 │  │ （protocol 名指し無）│  │
│  │ │WhatsApp│ caption:        │  │ [ビジョンを読む →]  │  │
│  │ │ 注文    │「J-Planet —     │  └────────────────────┘  │
│  │ │ thread │ ブラジルで稼働中」│  ※SKU grid 不掲載         │
│  │ └────────┘  (1 枚のみ)      │                            │
│  └────────────────────────────┘                            │
└──────────────────────────────────────────────────────────┘
```

### §7 規制 moat / TRUST — PRC を SOC2 級 badge に　`[N]`

- **狙い**: 巨人が複製不可能な現場の信頼 = 規制 rails を infra credibility として前面化。customer logo の代わりに regime/rails proof。
- **見出し**: 「巨人に複製できない、現場の信頼。」
- **pillars**: 通関（PRC / SISCOMEX）/ 税務（ICMS / NF-e）/ データ保護（LGPD）/ 責任ある AI。**PRC は marquee badge**。
- **数値方針**: 「唯一の日本系申請者」「24 ヶ月先行」は数値で出さず、benefit 文「PRC 適合通関 = 関税の予期せぬ発生なし」へ翻案。
- **asset policy**: テキスト + badge + step-collapse 純概念図（多数の BR 輸入手続き → 1 つの Andes workflow）。EC 画面出さない。ブラジル現地 / 港 / cargo の実写は可、AI 生成画像・笑顔の office worker stock photo 不可。
- **参照**: Wise（compliance を headline benefit に）、Flexport / Descartes（物流 infra tone）。

### §8 GROUP STRUCTURE — 静かな entity chain　`[N]`

- **狙い**: 親子構造を投資家 / プレス向けに提示。marketing hero から隔離した calm な扱い。
- **構成**: Andes Inc.（JP、IP/資金）→ 100% → Andes BR（holding）→ 99% → J-Planet（事業運用）。SVG/ASCII 図 + 1 段落。CNPJ 等の法的詳細は About 配下 sub-page。
- **asset policy**: entity 図のみ。商社 / conglomerate の tone は借りない（sir 除外軸）。

```
┌──────────────────────────────────────────────────────────┐
│  グループ構造                                              │
│   ┌──────────────┐ Andes Inc.(JP)  IP / 資金 / 統括        │
│   └──────┬───────┘                                        │
│          ▼ 100%                                            │
│   ┌──────────────┐ Andes BR  中間持株                     │
│          ▼ 99%                                             │
│   ┌──────────────┐ J-Planet  越境 / 国内 EC 運用           │
└──────────────────────────────────────────────────────────┘
```

### §9 FOOTER CTA — 2 主目的 + 2 副目的　`[N]`

- **見出し**: 「中南米の基盤を、一緒に建てる。」
- **dual CTA**: primary「販売を開始する」/「チームに加わる」。窓口 4 つ: 投資家 `ir@` / 採用 `careers@` / プレス `press@` / パートナー `partners@`（全 `@andes.global`）。
- **asset policy**: テキスト + button のみ。retail CTA は一切置かない。

```
┌──────────────────────────────────────────────────────────┐
│            中南米の基盤を、一緒に建てる。                  │
│   [販売を開始する →]■Crimson    [チームに加わる →]         │
│        投資家 / 採用 / プレス / パートナー                 │
├──────────────────────────────────────────────────────────┤
│ Andes Inc.(JP) / Andes BR / J-Planet                       │
│ Businesses  Company  Careers  Legal          ja / en       │
│ © Andes Inc. 2026 | Tokyo / São Paulo                      │
└──────────────────────────────────────────────────────────┘
```

---

## 6. アンチパターン（崩落口）

```
× hero / first scroll に EC・storefront・WhatsApp 画面を置く（最大リスク）
× hero 近傍に状態 chip「saiu do Japão」等の EC artifact
× agent を chat bubble + 商品 card + BRL 価格 + iniciar pedido で描く
× 1,700 SKU catalog grid を出す（数値漏洩 + shop-grid 化）
× caption の無い untitled な product screenshot
× EC 画面周囲に retail CTA（Shop / カート / Sign up / 始める）
× 単一「5 億人」のみ表示（→ 4 マクロ数字）
× 未完成 agent UI を real screenshot として偽装（vaporware 化）
× equal-weight brand logo wall（holding/conglomerate に読まれる）
× calm な最小主義 motion で野心を消す（reset 後 mandate と逆）
× 紫グラデ / 装飾 WebGL orb / cartoon-robot / 自動 carousel / cursor 追従
× 「北極星」「中南米の王」等の内部 jargon・Series A 機密の public 露出
× AI 生成画像 / 笑顔の office worker stock photo
× 商社（三井 / 三菱商事）系 gravitas の借用
```

---

## 7. typography / motion（docs/04 継承）

- **font**: Geist（display）+ Inter（body）+ Noto Sans JP（heading は Bold W7）。全 sans。
- **size**: Display L 72px（hero）/ Display M 56px（section）。数値は tabular figures。
- **motion 原則**: 1 page で動く要素は絞る。Hero text reveal（once）/ arc 描画（once）/ card hover 4px 上昇 + Crimson glow。`prefers-reduced-motion` 必達。自動 carousel・過剰 parallax・スクロール連動・cursor 追従・BGM は NG。
- **a11y**: WCAG 2.2 AA。Paper #FAFAF7 on Navy #0F1B3D = 14.2:1。

---

## 8. 未確定（sir 判断・後続）

| # | 論点 | 現状の提案 |
|---|---|---|
| A | 規制 moat の数値開示度 | 「唯一の日本系 PRC 申請者」「24 ヶ月先行」を benefit 文に翻案して伏せる |
| B | seller vs 採用 の上下 | §5 を seller primary、採用は §9 + Careers page |
| C | News / Press carousel を homepage に足すか | 現状 nav + footer 窓口に留置 |
| D | 非財務 momentum chip | eyebrow「東京 / サンパウロ — 2026 年稼働」。IVS 京都登壇予定等を出すか |

---

## 9. 実装ノート

- 実装は本 preview 線では **Claude が直接 `src/` 実装**で進める（reset 後も sir 合意の方針を踏襲、必要に応じ Codex）。
- 文言は `messages/{ja,en}.json` に集約（ハードコード禁止）。pt-BR は demo content のみ。
- 法人情報・数値は `docs/01` と本 doc §4 から引く。
- reset で `_archive/` 退避済みの v2–v5 / cinematic / sierra 実験は参照のみ、復活させない。
