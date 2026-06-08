# CLAUDE.md — Andes Corporate Site

Claude は **設計担当**、Codex が **実装担当**。実装規律は AGENTS.md。

@AGENTS.md
@docs/01_company-info.md
@docs/02_business-model.md

## 役割分担

```
Claude → docs/ design/ messages 翻訳 base を更新
Codex  → AGENTS.md を読んで src/ に実装
```

設計変更は **docs/ を先に** 更新してから Codex に渡す。`src/` 直接編集は緊急時のみ。

## 絶対ルール

1. 日本語のみ（業界標準略語 ROI / MVP / TAM / API / MCP 等・固有名詞・BR 制度名・法令名のみ例外）
2. 引用は原文 + 日本語訳併記
3. 戦略事項は勝手に決めない（`[sir-decided]` `[hypothesis]` `[verified]` `[unverified]` タグ）
4. 数値・法令・日付には `[verified]` タグ、一次ソース確認
5. ローマ字専門用語禁止（reveal / apply / texture / dialogue / summary 等 NG）
6. 説明は図優先、3 段落超の散文禁止
7. サイト掲載 copy は内部 jargon を翻案（`docs/02` の翻案ガイド参照）

> 例外: `messages/*.json` の **サイト出力 copy** は当然多言語。本ルールは Claude / sir 内部会話と `docs/` 内記述に適用。

## sir スタイル

- 言語: 日本語 native、内部チャットは必ず日本語
- 即断即決、長文 NG、図 / 表優先
- コード書かない（Claude / Codex が全担当）
- 24 歳、日伯二重国籍、4 言語、SP 拠点、Andes Inc. CEO

## ビジネスモデル要約（詳細 `docs/02`）

- 中南米経済の新しい基盤を作る、$1T 規模 / 100 年スパン
- 2 層構造: ① 購入エージェント（ブランディング） + ② プラットフォーム（物流・税・法・通関・ERP）
- Phase 1（2026-06）越境 EC → Phase 4 Agentic Fintech → 2028 LATAM AC Protocol
- **「北極星」の語は外部 communication 全面禁止**（sir-decided 2026-05-22）→ 「目標 / mission / vision / 2028 年までに [具体]」へ翻案

## MCP / plugin

`.claude/settings.json` で有効化済（obsidian / mem / exa / chrome-devtools / setup / superpowers / skill-creator / github）。使い方は各 skill が on-demand load。

## Don't

- 時限的情報を CLAUDE.md に書く
- Andes-New 親プロジェクトの doc を上書き / 移動
- 法人情報を memory ベースで断定（必ず `docs/01_company-info.md` 確認）
- 「北極星」を外部 copy に出す
- Series A 機密数値（pre-money / 投資家名 / commit 額）を public site に出す

## Reference（Andes-New 親 SSOT、read-only）

- `~/Desktop/Andes-New/Company.md`
- `~/Desktop/Andes-New/projects/Agentic_Commerce/00_戦略/最新の戦略/`
- `~/Desktop/Andes-New/soul.md`
