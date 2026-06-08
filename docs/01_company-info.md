---
title: 会社情報 SSOT
date: 2026-05-22
updated: 2026-05-22
status: validated
source: ~/Desktop/Andes-New/Company.md (2026-05-20 snapshot)
tags: [company, legal, ssot]
---

# 01 会社情報 SSOT

> サイト掲載の会社情報の **唯一の真実**。`messages/{locale}.json` の住所 / CNPJ / 代表名 等はここから引く（ハードコード禁止、変更時はここを先に更新）。

---

## グループ構造

```
┌─────────────────────────────────────────────────────┐
│  Andes Inc.（日本、親会社）                          │
│  - 資金調達 / IP 保有 / グループ統括                  │
└──────────────────────┬──────────────────────────────┘
                       │ 100% 所有
                       ↓
┌─────────────────────────────────────────────────────┐
│  Andes BR（ブラジル、中間持株、100% 子会社）          │
│  - Andes Inc. と J-Planet をつなぐ holding           │
└──────────────────────┬──────────────────────────────┘
                       │ 99% 所有
                       ↓
┌─────────────────────────────────────────────────────┐
│  J-Planet（ブラジル、事業会社）                       │
│  - 越境 EC / 国内 EC オペレーション                    │
│  - 規制 compliance（PRC / SISCOMEX / ANVISA 等）      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  J-Vita（J-Planet 配下、医療 EC、別 vault で開発中）  │
│  - GLP-1 / 育毛 / ホルモン等の個人輸入代行            │
│  - Target launch: 2026-06-01                         │
└─────────────────────────────────────────────────────┘
```

---

## Andes Inc.（日本親会社）

| 項目 | 内容 |
|---|---|
| 正式名称 | Andes Inc. |
| 登記住所 | 〒150-0041 東京都渋谷区神南１丁目１１−４ FPGリンクス神南 5階 |
| 代表者 | 藤田テツ（CEO） |
| 役割 | 資金調達 / IP 保有 / グループ統括 |
| 資金保管 | グループ全体の資金は Andes Inc. に集約 |

---

## Andes BR

| 項目 | 内容 |
|---|---|
| 役割 | Andes Inc. の 100% 子会社、ブラジル中間持株 |
| 所在地 | サンパウロ市内（J-Planet と同住所） |
| 出資 | J-Planet に 99% 出資 |

---

## J-Planet（ブラジル事業会社）

| 項目 | 内容 |
|---|---|
| 正式名称 | JPLANET COMÉRCIO INTERNACIONAL E DISTRIBUIÇÃO LTDA |
| CNPJ | 63.097.119/0001-44 |
| NIRE | 35268158711 |
| 所在地 | Av. Paulista, 2300 – Pilotis – Bela Vista, São Paulo - SP, CEP 01310-300, primeiro andar |
| 移転日 | 2026-04-22（旧住所から） |
| 資本金 | R$ 1,000,000 |
| 株主構成 | Andes Co. Ltda 99% / Tetsu Fujita Kumazawa 1% |
| 単独 Diretor | Tetsu Fujita Kumazawa（藤田テツ） |
| 銀行口座 | J-Planet 名義 / ブラジル現地（Itaú 等） |
| CNAE 主 | 化粧品 卸 / 輸入 / 国際商業 |
| CNAE 追加 | 4772-5/00、4646-0/01、4646-0/02（2026-04-22 追加） |
| 規制 compliance | PRC（申請中） / SISCOMEX / ANVISA / MAPA / VIGIAGRO / BACEN RDE-IED |

---

## J-Vita（J-Planet 配下、医療 EC）

| 項目 | 内容 |
|---|---|
| 法人 | J-Medical Ltda（Andes Group 子会社、設立予定） |
| consumer brand | J-Vita（J-Planet sibling brand） |
| 役割 | ブラジル人向け日本品質医療の Mandato 個人輸入代行 |
| Phase 0a 製品 | GLP-1 / 育毛 / ホルモン / ダイエット薬 |
| Target launch | 2026-06-01 |
| 開発 vault | `~/Desktop/j-vita/`（独立 CLAUDE.md、別開発線） |

---

## 連絡先（サイト掲載用）

| 窓口 | 用途 | 受け口 |
|---|---|---|
| 投資家 | Series A 関連、IR | `ir@andes.global` |
| 採用 | 候補者応募、人事問合せ | `careers@andes.global` |
| プレス | メディア取材、登壇依頼 | `press@andes.global` |
| パートナー | 事業提携、ベンダー | `partners@andes.global` |
| 一般 | その他 | `hello@andes.global` |

> **ドメイン**: `andes.global` 確定 [verified 2026-05-22 sir-decided]。グループ公式は本ドメインに統一。
> **TODO[sir-decide]**: メール alias 5 個（上記）の受信フロー（誰が見る・SLA）を確定。

---

## ドメイン

| ドメイン | 用途 | 状態 |
|---|---|---|
| **andes.global** | **グループ公式（確定）** | **[verified 2026-05-22]** |
| andes.inc | 代替（取得検討） | 未確定 |
| andes.com.br | BR ローカル（取得検討） | 未確定 |
| jplanet.com.br | J-Planet 既存サイト | 別 site |

---

## 出典 / 更新ルール

- 出典: `~/Desktop/Andes-New/Company.md`（snapshot 2026-05-20）
- 法人詳細の正典: `~/Desktop/Andes-New/company/company.md` v3.0
- このファイルは **サイト用 snapshot**。Andes-New 側で数値変更があれば、ここを反映する形で追従
- 更新時は `updated:` 日付を frontmatter で更新
