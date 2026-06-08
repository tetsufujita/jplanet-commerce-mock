---
title: ビジネスモデル SSOT
date: 2026-05-22
updated: 2026-05-22
status: validated
sources:
  - ~/Desktop/Andes-New/soul.md
  - ~/Desktop/Andes-New/projects/Agentic_Commerce/00_戦略/最新の戦略/00_LATAM_Agentic_Commerce_Protocol_Vision.md
  - ~/Desktop/Andes-New/projects/Agentic_Commerce/00_戦略/最新の戦略/05_business_model_a2a_scalability_2026-04-28.md
  - ~/Desktop/Andes-New/projects/Agentic_Commerce/00_戦略/最新の戦略/06_2層戦略_shuya原案_2026-05-01.md
  - ~/Desktop/Andes-New/projects/Agentic_Commerce/00_戦略/最新の戦略/15_新ビジネスモデル_Deck_2026-05-01.md
tags: [business_model, north_star, 2_layer, phase, ssot]
---

# 02 ビジネスモデル SSOT

> サイト掲載のビジョン / 戦略 / 事業説明の **唯一の真実**。
> public 向け表現は内部 SSOT を **翻案** したものを使う（生の表現「中南米の王」等は内部のみ）。

---

## 北極星

**中南米を $1T 経済圏として再設計し、その基盤を Andes が作る。**

- 内部表現（soul.md）: 「中南米で次の $1T 企業を建て、中南米の王となる」
- 数値根拠: LatAm GDP $6T の 1-2% を自社インフラに通す規模
- 比較: MercadoLibre $100B の 10 倍、Nubank $60B の 16 倍
- 時間軸: 100 年続く帝国 / 6 年で 6 兆円 → 15 兆円 NASDAQ IPO

### 実装ルートとしての北極星

**2028 LATAM Agentic Commerce Protocol（OSS de facto）**

- PIX / NF-e / ICMS / LGPD / CDC を MCP 化して LATAM AC の **共通インフラ** にする
- Andes がプロトコル発行体になる = 巨人（OpenAI / Google / Anthropic）が Andes を呼ぶ構造
- 達成時の position = 「中南米の AWS + Stripe + 楽天」

---

## 戦略の核 — 2 層構造（しゅうや原案 2026-05-01）

```
                ┌──────────────────────────────────────┐
                │  Layer ① 購入エージェント            │
                │  ─ 巨人を LLM として使う              │
                │  ─ ブランディング / PR 価値           │
                │  ─ 巨人にリプレイスされても OK        │
                └─────────────────┬────────────────────┘
                                  │
                                  ↓
                ┌──────────────────────────────────────┐
                │  Layer ② プラットフォーム            │
                │  ─ 物流 / 税務 / 法務 / 通関         │
                │  ─ ERP / 会計 / fintech             │
                │  ─ 大手には構築できない              │
                │  ─ ここで本当の価値が出る            │
                └─────────────────┬────────────────────┘
                                  │
                                  ↓
                ┌──────────────────────────────────────┐
                │  endgame: MCP 発行                   │
                │  巨人が Andes プロトコルを呼ぶ        │
                └──────────────────────────────────────┘
```

### なぜこの 2 層構造か

| Layer | リスク | 戦略意図 |
|---|---|---|
| ① 購入エージェント | 巨人 (OpenAI / Claude) と LLM 性能勝負になれば負ける | ブランディング層、消費者接点、リプレイスされても OK |
| ② プラットフォーム | 既存大手は構築困難（物理・法・税・規制の knowledge moat） | ここで価値を独占、現地深層への投資が moat |

### 既存 AC モデル（巨人型）との対比

```
[巨人型]
[OpenAI / Claude] → [メルカドリブレ / Shopee / Amazon] → 企業・メーカー
購入 agent              既存大手 EC                       (LATAM 大手と巨人で握る)

[Andes 型]
[OpenAI / Claude] → [J-Planet agent] → [J-Planet プラットフォーム] → 企業・メーカー
LLM として利用       Andes 購入 agent      Andes 販売 agent
                    (ブランディング)        (LATAM 専用深層インフラ)
```

---

## Phase 構造

```
Phase 1  2026-06-01〜      catalog 全件投入 + WhatsApp B2C 越境エージェント
                          - 日韓商品 1,700 SKU
                          - WhatsApp + J-Planet 自社サイト
                          - PRC 申請中 / JP Post EMS bridge

Phase 2  2027 想定         BR 国内 EC 横断エージェント A2A
                          - Marketplace モデル A（seller が NF-e 発行）
                          - リベルダージ / MARUKAI 系列 onboarding
                          - 既存 EC との A2A 接続

Phase 3   2028 想定        エージェントネイティブ ERP × B2B Marketplace × Factoring
                          - 旧 BR_SMB_GTI 統合
                          - SMB 向け AI ERP
                          - 売掛債権 Factoring

Phase 3.5 並走             日本→BR B2B エージェント
                          - 商社機能の AI 化

Phase 4   2029-2030        Agentic Fintech 全面
                          - 融資 / 売掛 / クレジットカード / 保険 / 送金
                          - ステーブルコイン + Drex 統合
                          - 双方向インフラ（Andes JP ⇔ BR 資金移動）

endgame  2028+             LATAM AC Protocol（OSS de facto）発行
```

---

## 競合 / Moat

### 構造的 moat

1. **「Andes 自身がマーチャント」** — Agentic Commerce 業界共通の merchant 獲得問題を構造的に持たない
2. **PRC（Programa Remessa Conforme）申請中の唯一の日本企業** — 24 ヶ月の先行優位
3. **二重国籍 founder × 4 言語** — JP capital と LATAM 現場の両方にアクセスできる稀有な position
4. **Korea-Brazil 政府レベル MOU の追い風**（2026-02 Lula × Lee で 10 MOU、化粧品 + AI 明示）
5. **二層構造 + MCP 発行 endgame** — 巨人と正面衝突せず逆顧客化する構造

### 競合との position 差

| 競合 | 位置 | Andes との差 |
|---|---|---|
| MercadoLibre | LATAM 大手 EC | Andes は merchant 側、A2A で連携可 |
| Shopee | アジア発 LATAM 展開 | Andes は日本品質 × 越境 niche |
| Nubank | LATAM Fintech 大手 | Andes Phase 4 で接続点、現状は別領域 |
| Shopify | EC SaaS | Andes は merchant operator 自身、SaaS ではない |
| OpenAI Instant Checkout | 巨人の AC | 2026-03 撤退、巨人は merchant 持たないため失敗 |

---

## 事業 portfolio（現時点）

```
Andes Group
├── J-Planet（メイン事業、Phase 1 ローンチ 2026-06-01）
│   - 越境 EC（日韓 → BR）
│   - WhatsApp エージェント UI
│   - 美容 / 化粧品中心 1,700 SKU
│
├── J-Vita（セカンド事業、Phase 0a ローンチ 2026-06-01 target）
│   - 医療個人輸入代行（Mandato）
│   - GLP-1 / 育毛 / ホルモン / ダイエット
│
└── LATAM AC Protocol（北極星、2028 target）
    - OSS インフラ発行
    - PIX / NF-e / ICMS / LGPD / CDC over MCP
```

---

## サイト向け表現の翻案ガイド

| 内部表現（NG for public） | サイト向け表現（OK） |
|---|---|
| **「北極星」**（sir-decided 2026-05-22、語自体が NG） | 「目標」/「mission」/「vision」/「2028 年までに [具体的 goal]」 |
| 中南米の王となる | 中南米経済の新しい基盤を作る |
| $1T 帝国 | LATAM 次世代インフラ企業 |
| 巨人を逆顧客化する | グローバル AI と LATAM 現地の橋を作る |
| 6 年で 6 兆円 → 15 兆円 IPO | 長期で時価総額数兆円規模の経営 |
| 大統領になる | (出さない) |

> 投資家向け deck の数値は **別途 IR 資料** で出す。public site では北極星の方向性のみ示す。

---

## サイト IA への落とし込み（preview）

- **Top**: 「LATAM Agentic Commerce のインフラを建てる」+ 3 事業 portfolio
- **About**: 北極星 + 2 層構造（しゅうや原案の図を簡略化）+ Why now
- **Businesses**: J-Planet / J-Vita / Phase roadmap
- **Careers**: 「Andes は何を作っているか」→ Claude Code Native engineer 採用
- **Press**: IVS 京都登壇予定 / メディア掲載
- **Contact**: 4 窓口（投資家 / 採用 / プレス / パートナー）

詳細は `docs/05_pages-spec.md` 参照。
