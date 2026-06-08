---
title: 事業 portfolio SSOT
date: 2026-05-22
updated: 2026-05-22
status: validated
tags: [services, portfolio, ssot]
---

# 03 事業 portfolio SSOT

> 各事業の **サイト掲載用の説明 source**。詳細は親プロジェクト Andes-New に SSOT あり、ここはサイト用要約。

---

## 全体像

```
┌──────────────────────────────────────────────────────────────┐
│                       Andes Group                            │
│                                                              │
│   現在動いている事業         次に建てる事業       北極星        │
│   ──────────              ──────────       ──────────     │
│                                                              │
│   ┌──────────┐            ┌──────────┐    ┌──────────┐      │
│   │ J-Planet │            │  J-Vita  │    │  LATAM   │      │
│   │  越境 EC  │  ──────→   │ 医療 EC  │ →  │   AC     │      │
│   │ 2026-06   │            │ 2026-06  │    │ Protocol │      │
│   │  launch  │            │  launch  │    │   2028   │      │
│   └──────────┘            └──────────┘    └──────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## J-Planet（越境 EC、Phase 1 メイン）

### 概要

| 項目 | 内容 |
|---|---|
| 一言で | 日本・韓国の美容 / 化粧品を WhatsApp エージェント経由でブラジル消費者に届ける越境 EC |
| 法人 | JPLANET COMÉRCIO INTERNACIONAL E DISTRIBUIÇÃO LTDA（CNPJ 63.097.119/0001-44）|
| Launch | 2026-06-01 |
| 対象 | ブラジル一般消費者（B2C） |

### 何が新しいか

1. **WhatsApp エージェント UI** — 既存 EC（メルカドリブレ / Shopee）と違い、WhatsApp で AI と会話して買う体験
2. **PRC 申請中の唯一の日本企業** — 越境 EC の税優遇 program に日本企業として唯一申請、24 ヶ月先行
3. **catalog 全件投入戦略** — 1,700 SKU を Phase 1 から投入（フィルタなし戦略、ロングテール検索クエリ網羅）
4. **JP/KR ニッチカテゴリの breadth** — ¥2,500 以下まで網羅、これが moat

### 商品カテゴリ（Phase 1）

- スキンケア 7 カテゴリ（化粧水 / 美容液 / フェイスクリーム / メイク落とし / アイクリーム / パック・マスク / 顔用日焼け止め）
- 計 1,700 SKU 投入予定

### ターゲット

- ブラジル中産階級〜の女性、20-40 代
- 日本 / 韓国コスメに関心あり（K-beauty / J-beauty 既ファン）
- WhatsApp ネイティブ（BR ユーザの 95%+ が利用）

### サイトでの位置付け

- Top の事業 portfolio で前面に出す
- /businesses 配下の主事業 page
- Phase 1 = 現在動いている唯一の事業として明示

---

## J-Vita（医療個人輸入、セカンド事業）

### 概要

| 項目 | 内容 |
|---|---|
| 一言で | ブラジル人向けに日本品質の医療を Mandato 個人輸入代行で届ける D2C |
| 法人 | J-Medical Ltda（Andes Group 子会社、設立予定）|
| Brand | J-Vita（J-Planet sibling brand） |
| Launch | 2026-06-01 target |
| 対象 | ブラジル一般消費者（B2C） |

### 何が新しいか

1. **Mandato（個人輸入代行）スキーム** — 商業輸入 (DI) ではなく個人輸入の枠組みで、医薬品 ANVISA 登録なしで患者個人の処方ベース提供
2. **日本品質の医療アクセス** — ブラジル国内では入手困難な日本ジェネリック / 先発薬
3. **Phase 0a 製品ライン** — GLP-1（痩身）/ 育毛 / ホルモン / ダイエット薬

### 別 vault 開発

- 開発 / spec / 法務 / 実装は別 vault `~/Desktop/j-vita/` で進行
- Andes-New 側は pointer のみ（`projects/Medical_EC/README`）
- このサイトでは J-Planet sibling brand として紹介、詳細 link は j-vita 側 site（別途構築）

### サイトでの位置付け

- /businesses 配下、J-Planet と並列に紹介
- 「Andes の 2 つ目の事業」として位置付け
- 詳細 link は将来 j-vita.com.br（仮）へ

---

## LATAM Agentic Commerce Protocol（北極星、2028 target）

### 概要

| 項目 | 内容 |
|---|---|
| 一言で | LATAM の Agentic Commerce 共通インフラを OSS de facto として発行 |
| 目標 | 2028 protocol release |
| 内容 | PIX / NF-e / ICMS / LGPD / CDC を MCP 化、 LATAM AC の共通言語にする |

### なぜ Andes が出せるか

- Phase 1-4 を通じて、merchant 側 / プラットフォーム側 / fintech 側 の **全層を実運用** している唯一の企業
- 各層で蓄積した knowledge と data が protocol 化の前提
- 巨人 (OpenAI / Google / Anthropic) は LATAM の物理・規制・税の現場を持たない

### endgame シナリオ

```
2028  protocol release
       ↓
       OpenAI / Claude / Google が LATAM commerce を扱う時に Andes protocol を呼ぶ
       ↓
       Andes = LATAM AC layer の de facto standard
       ↓
       Andes group time horizon: 100 年スパン、$1T+ enterprise
```

### サイトでの位置付け

- /about または /vision page で **長期ビジョン** として提示
- 具体的な protocol spec / API は未公開、思想と方向性のみ示す
- 「我々はなぜ EC を作っているのか」の答えとして提示

---

## サイト掲載時の優先順位

```
[強] J-Planet           — 現在動いている、Phase 1 ローンチ
[強] LATAM AC Protocol  — 北極星、なぜを語る
[中] J-Vita             — セカンド事業、現状は紹介のみ
[弱] Phase 3-4          — 将来事業、概念だけ示す
```

> Phase 3-4 の Fintech / B2B Marketplace 等は public site では **概念だけ** 示す。具体的な launch 時期や金額は出さない。Series A 投資家向けは別 deck で詳細を出す。
