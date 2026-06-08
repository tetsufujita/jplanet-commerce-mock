---
title: 10 二刀流ワークフロー（Codex × Claude Code）ベストプラクティス
updated: 2026-06-02
status: living（随時追記）
sources: 公式ドキュメント fetch 検証済（末尾に URL 一覧）
---

# 10 二刀流ワークフロー ベストプラクティス

> Claude（設計）× Codex（実装）の二刀流を最適運用するための索引。
> 一次情報（code.claude.com / developers.openai.com / agents.md / Anthropic engineering）を fetch 検証済。
> 各項目: 実践 → なぜ → Andes での当て方 → 出典。

## 0. 結論 — Andes の型

```
sir（CEO・コード書かない）
   │ 戦略判断のみ（[sir-decided] / copy 承認 / plan 承認）
   ▼
Claude（設計／planner＋reviewer）          Codex（実装／executor）
   ├ docs/ を SSOT として先に確定           ├ AGENTS.md + docs/ を読む
   ├ spec / copy / 色 token                 ├ src/ を実装
   ├ 実測 → token 表                        ├ /review で自己点検
   └ diff レビュー（src は書かない）  ──→    └ done = lint/typecheck/test/build 緑
        共有契約 = CLAUDE.md / AGENTS.md / docs/
```

**評価: 既に正解に近い。** spec-driven・共有契約・役割分離・フォルダ責務分離の 4 点は一次情報のベストプラクティスと一致。伸ばすべきは §2 の数点のみ。

---

## 1. 既に正しい 4 点（検証で裏取れた）

| 実践 | Andes 現状 | 出典 |
|---|---|---|
| **spec-driven**（仕様を先に固め docs を SSOT に） | 「設計変更は docs/ を先に更新→Codex に渡す」「src/ 直接編集は緊急時のみ」 | GitHub spec-kit / Claude BP |
| **共有契約**（両エージェントが同じ規律を読む） | CLAUDE.md（設計）+ AGENTS.md（実装）+ `@AGENTS.md` import | agents.md / Codex docs |
| **役割分離**（planner / executor / human） | Claude=設計 / Codex=実装 / sir=戦略 | Anthropic multi-agent |
| **競合回避**（同一ファイル同時編集を避ける） | Claude→docs/design/messages、Codex→src/、docs は Claude が唯一の writer | Claude worktrees |

---

## 2. すぐ伸ばす 5 点（アクション）

1. **各 spec の末尾に「out of scope」＋「PASS 条件（e2e 検証ステップ）」を Claude が必ず書く**
   - なぜ: 自己完結した spec が AI の推測を消す（*"name the files/interfaces, state what is out of scope, end with an end-to-end verification step"*）。
   - 当て方: `docs/05` `docs/07` の各 section 末尾に「どの URL でどの copy/数字が出れば PASS か」を明記 → Codex の done 基準になる。
2. **enforcement 必須の絶対ルールは hook / lint で機械ゲート化**
   - なぜ: AGENTS.md / CLAUDE.md は *instruction であって enforcement ではない*。守らせ切るものは別手段が要る。
   - 機械ゲート対象: ハードコード hex 禁止 / `<img>` 禁止 / `any` 禁止 / **「北極星」露出禁止** / **Series A 機密（pre-money・投資家名・commit 額）の public 流出**。
3. **done = `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 緑 を「完了の定義」に昇格**
   - なぜ: 検証手段が無いと「動いてそう」が唯一の signal になり人間が検証ループになる。
   - 当て方: Stop hook で build 緑を機械チェック → 未検証の done を構造的に止める。
4. **Codex に渡すのは docs/ の確定 spec だけ。設計チャットの生ログは渡さない**
   - なぜ: 生 jargon（「中南米の王」等）が漏れると CLAUDE.md 違反 copy が混入する。
   - 当て方: 翻案済み copy（docs/02 翻案ガイド）だけを渡す。
5. **並列実装は 1 タスク 1 worktree ＋ `feat/*` ブランチで隔離**
   - なぜ: 二つのエージェントが同じファイルを触ると衝突。worktree は物理隔離。
   - 当て方: §4/§5 を別 Codex セッションで回す時は `claude --worktree`、`.worktreeinclude` に `.env.local`。

---

## 3. Codex（実装側）運用

### タスクの渡し方 — 4 要素テンプレ
```
Goal:       何を作る/変えるか（例: §4 Press セクション実装）
Context:    関係する docs/files（docs/05 の i18n key、docs/01 の数値、design/wireframes）
Constraints: AGENTS.md（文言ハードコード禁止→messages/*.json、3 locale 全更新、next/image、any 禁止）
Done when:  pnpm lint && typecheck && test && build 緑 ＋ spec の PASS 条件を満たす
```

### config（`.codex/config.toml` をリポジトリに置く・推奨）
```toml
sandbox_mode    = "workspace-write"   # src/ は書ける、外は不可
approval_policy = "on-request"        # 暴走防止の既定（never/full-access は使わない）
# project_doc_max_bytes = 32768       # AGENTS.md 連結上限（簡潔に保てば足りる）
```
- profiles: `--profile review`（read-only・設計レビュー）/ `--profile build`（workspace-write・実装）で承認とモデルを一括切替。
- **絶対ルール・Don't・数値は AGENTS.md / docs に checked-in。生成 Memories に頼らない**（揺れる）。

### スラッシュコマンド（反復を回す）
- `/plan` 計画 → 実装 → `/diff` 変更確認 → **`/review`（commit 前のセカンド reviewer・コードは変えない）** → PR 前 mandatory。
- カスタム review 指示例: 「文言/数値のハードコード混入」「`<img>`→`next/image`」「`any`/`console.log`/unused import」。
- context 肥大は `/compact`、無関係は別スレッド or `/fork`。

### CI（将来）
- 公式 `openai/codex-action@v1`（API key を proxy 経由で隠蔽）。PR ごとに AGENTS.md の Don't＋「北極星」露出＋Series A 機密をチェックさせると Don't をゲート化できる。

---

## 4. Claude Code（設計側）運用

| テーマ | 実践 | Andes での当て方 |
|---|---|---|
| CLAUDE.md | 簡潔（〜200 行）・効くものだけ・`@import`。*肥大は instruction を無視させる* | 時々しか効かない知識（再現手順・token 実測値）は `.claude/skills/` の SKILL.md へ逃がす |
| context | `/clear` で無関係タスク分離、2 回直して直らなければ `/clear` して prompt 書き直し | docs 編集と src レビューのセッションを分ける |
| subagent | 探索/リサーチは subagent に隔離して要約だけ受ける | design research・license 監査・並列レビューを fan-out（本 doc 自体がその実践） |
| plan mode | explore→plan→implement→commit を分離、承認ゲート | feature は plan 承認を sir ゲートに |
| hooks | PostToolUse で lint/format、Stop で build 緑ゲート（deterministic） | §2-2/§2-3 の機械ゲート化の実体 |
| MCP | 必要なものだけ・tool-search で遅延ロード | plugin 多数 → tool-search 維持で context 節約 |
| memory | auto memory で cross-session learning、肥大化したら整理 | `reference_*` / `feedback_*` に判断を蓄積（運用中） |

---

## 5. ハンドオフの型（設計 → 実装 → 検証 → レビュー）

```
① Claude: docs/ に spec 確定（末尾に out-of-scope + PASS 条件）
② Codex : 4 要素テンプレで受領 → 実装 → /review で自己点検
③ gate  : pnpm lint && typecheck && test && build（done の定義・hook 化）
④ Claude: diff を fresh context でレビュー（spec 準拠・北極星/機密/ハードコード）
          ※ reviewer は「正しさに効く gap だけ報告、スタイル指摘は除外」と縛る
⑤ sir   : copy / [sir-decided] / plan の承認のみ（コードは書かない）
```

- reviewer は実装した本人にやらせない（fresh context はバイアス無し）。
- human-in-the-loop は **spec/copy 承認 ＋ plan 承認の 2 点のみ**。実装の逐次承認に sir を巻き込まない。

---

## 6. 失敗パターン回避

| 失敗 | 対策 |
|---|---|
| 仕様不足で実装暴走（vibe coding） | spec を self-contained に＋PASS 条件（§2-1） |
| context 共有しすぎ | 無関係タスクは `/clear`。Codex には確定 spec だけ渡す（§2-4） |
| 修正の堂々巡り | 2 回失敗で `/clear` → prompt 書き直し |
| CLAUDE.md 肥大化 | 容赦なく剪定、効くものだけ。enforcement は hook 化 |
| 無際限な探索 | subagent に隔離して要約だけ受ける |
| レビュー無し merge | done 前に fresh reviewer＋自動検証ゲート（§5） |

---

## 7. AI Skills（Codex/Claude に入れる「教科書」）— 導入候補

> skill = SKILL.md 形式の手順書。AI に「どう書くか」を注入する。`npx skills add <github>` で導入。
> CLI `skills` は **Vercel Labs 製**（rauchg・MIT・約 55 エージェント対応）。Claude Code は `/plugin marketplace add <repo>` でも可。

| skill | 何 | 実数 | ライセンス | Andes 判定 |
|---|---|---|---|---|
| **gsap-skills**（greensock 公式） | AI に GSAP を正しく書かせる教科書 8 冊（core/timeline/scrolltrigger/plugins=SplitText・Flip・SVG変形/utils/react/performance/frameworks） | ★7,338・最終更新 2026-04-21（約6週停滞） | **MIT**（GSAP 本体も Webflow で商用無償） | ✅**導入推奨**（必要 4 冊に絞る）。「AI のアニメが PPT」問題に直撃。ただし銀の弾丸でなく質感は設計レビュー必須 |
| **frontend-design**（Anthropic 公式） | コード前に美学方向を決めさせる指示書 1 枚（4.4KB）。"educational sample" で製品ではない | repo 全体 ★145k（skill 単体ではない） | Apache-2.0 | ✕**追加不要**。hallmark が上位互換で在中 ＋「毎回 BOLD に美学を変えろ」が Andes 固定ブランド（Crimson pin-point）と衝突 |
| **hallmark**（Together AI・**既に在中**） | anti-slop 設計 skill。slop 検査 65 ゲート / audit・redesign・study verb。frontend-design を出典に含む拡張版 | SKILL.md 64KB + 参照 30 ファイル | MIT | ⚠**活用すべき**。`.agents/skills/hallmark` 実体 + `.claude/skills` へ symlink。未活用 → 「新規 UI は hallmark を通す」を運用化 |

**誇張ツイートの訂正**: 「13.6万★」=実際は repo 全体 145k ／「41.8万 install」=一次ソースで裏取れず（引用しない）／「Anthropic 公式 CLI」=誤り（CLI は Vercel 製、skill は全エージェント横断のサンプル集）。

**導入コマンド例（未実行・要 sir go）**:
```bash
# gsap-skills を必要分だけ
npx skills add https://github.com/greensock/gsap-skills \
  --skill gsap-scrolltrigger --skill gsap-timeline --skill gsap-react --skill gsap-performance
# または Claude Code marketplace 経由
# /plugin marketplace add greensock/gsap-skills
```

**未適用**: gsap-skills の導入はまだ（sir 確認待ち）。hallmark は在中だが docs 運用化まだ。

出典: github.com/greensock/gsap-skills ／ github.com/anthropics/skills（skills/frontend-design）／ github.com/vercel-labs/skills ／ gsap.com/pricing

---

## 出典 URL 一覧（fetch 検証済）

**Claude Code**
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/worktrees

**Codex**
- https://agents.md/
- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/config-reference
- https://developers.openai.com/codex/local-config
- https://developers.openai.com/codex/learn/best-practices
- https://developers.openai.com/codex/cli/slash-commands
- https://developers.openai.com/codex/app/review
- https://developers.openai.com/codex/noninteractive
- https://github.com/openai/codex-action

**二刀流 / spec-driven / multi-agent**
- https://www.anthropic.com/engineering/built-multi-agent-research-system
- https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- https://github.com/github/spec-kit

## 次のリサーチ候補（living）
- Next.js 15 / React 19 特有の Codex 実装注意（Server Component / 'use client' の AI 実装ミス傾向）
- Claude Code hooks の具体レシピ（hardcode hex 検出・i18n 3 locale sync チェック）
- prompt 設計（Codex への section 実装プロンプトの型ライブラリ）
