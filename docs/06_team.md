---
title: チーム SSOT
date: 2026-05-22
updated: 2026-05-22
status: validated
tags: [team, bio, ssot]
---

# 06 チーム SSOT

> サイトに掲載する team 紹介の source。
> 個人情報の露出度は **sir 承認後** に確定する [TODO sir-decide]。

---

## team 一覧

| Role | 名前 | 言語 | サイト掲載 |
|---|---|---|---|
| Founder / CEO | 藤田テツ（sir） | JP native / PT / ES / EN | 主役、bio 掲載 |
| Engineer / Architect | しゅうや | JP / EN | 掲載（要 sir 承認） |
| 実務統括 / 通訳 | えりき | PT / ES / JA | 掲載（要 sir 承認） |

---

## 藤田テツ（Founder / CEO）

### サイト掲載 bio（candidate v1）

```
日本・ブラジル二重国籍、24 歳。サンパウロ拠点。
J-Planet 創業者、Andes Inc. CEO。
4 言語（日本語 native / ポルトガル語 / スペイン語 / 英語）。

19 歳でブラジル渡航、22 歳で J-Planet を創業。
日韓品質の越境 EC からスタートし、現在は LATAM 全域の
Agentic Commerce インフラ構築を進めている。

長期ビジョン: 中南米経済の新しい基盤を作り、
100 年続く企業を建てる。
```

### 登壇予定

- **IVS 京都 2026**: 2026-07-01 〜 07-03、テーマ「Japan is Back」
  - 会場: みやこめっせ + ホテルオークラ京都
  - 内容: 24 歳 / 二重国籍 / Agentic Commerce / 4 言語 / 長期ビジョン

### 表現の翻案（内部 vs public）

| 内部 SSOT 表現 | サイト掲載表現 |
|---|---|
| 「中南米の王となる」 | 「中南米経済の新しい基盤を作る」 |
| 「ブラジル大統領になる」 | （非掲載） |
| 「6 年で 6 兆円 → 15 兆円 IPO」 | 「長期で時価総額数兆円規模の経営」 |

---

## しゅうや（Engineer / Architect）

### 役割

- 開発担当（エンジニア）
- sir × しゅうや = Visionary × Architect ペア
- 2 層戦略 + MCP 発行 grand strategy の構造化原案者（2026-05-01）

### サイト掲載 bio（candidate v1、要 sir + しゅうや 確認）

```
Andes グループのテクノロジー責任者。
sir のビジョンを実装可能な構造に翻訳する Architect。
2026 年 5 月に Andes の 2 層戦略 grand strategy を確定させた。

J-Planet の GitHub repository を統括し、Claude Code を日常的に使う
"AI-first engineering" を実践している。
```

### サイト掲載 [TODO sir-decide]

- 顔写真出すか
- 苗字 / 詳細経歴出すか
- LinkedIn / X リンクするか

---

## えりき（実務統括 / 通訳）

### 役割

- 実務統括補佐
- 通訳（PT / ES / JA トリリンガル）
- 言語ブリッジ（ベンダー / パートナーとの実務窓口）

### サイト掲載 [TODO sir-decide]

- 掲載するかしないか
- 掲載する場合の bio

---

## チーム紹介の方針

```
原則:
  - 顔写真は本人承認後のみ掲載
  - 苗字 / 詳細経歴は本人承認後のみ
  - 外部 SNS link は本人承認後のみ
  - 投資家 / 採用候補が「誰と話すか」が見える程度の情報量に絞る
```

### Card デザイン要件（design/wireframes.md と連動）

```
┌────────────────────────────┐
│  ┌──────────┐             │
│  │  Photo   │  Name        │
│  │ (square) │  Role        │
│  └──────────┘  Languages   │
│                            │
│  Short bio (3-4 lines)     │
│                            │
│  [optional: link]          │
└────────────────────────────┘
```

---

## 採用候補へのメッセージ（careers ページ連動）

```
Andes は少数精鋭のチームで、
AI を最大限に使い build スピードで他社の 5-10 倍を出す層を募集している。

採用フィルター:
  - Claude Code / Codex を日常的に使っている
  - 自律的に意思決定して進める
  - 第一原理で考える

課題:
  - 1 週間で 5 agent (CEO / Dev / Mkt / Fin / Legal) を build
  - Claude が rubric で grade、70 点以上 pass
  - Day 1 → Day 7 の delta が最重要 signal
```

詳細は `docs/05_pages-spec.md` の /careers セクション参照。
