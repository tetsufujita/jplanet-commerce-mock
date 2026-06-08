---
title: 09 ホームページ実装 発注書（cinematic 版・Codex 向け）
updated: 2026-06-04
status: ★Codex 発注書（sir mockup 2026-06-04 を正とする）
basis: design/reference/（sir 作成 mockup 3 枚）＋ docs/01（数値）＋ AGENTS.md（stack）
owner: Claude=本 doc 確定 / Codex=実装 / sir=感覚ジャッジ
---

# 09 ホームページ実装 発注書（cinematic 版）

> **Codex はこの 1 枚を読めば homepage を実装できる**ことを目標にした発注書。
> 文言・数値・色は本 doc と docs/01 から引く（ハードコード禁止）。

---

## 0. これは何か（位置づけ）

- sir が **2026-06-04 に mockup（`design/reference/`）で決めた cinematic 方向**の homepage を Codex が実装するための発注書。
- ⚠ この方向は **docs/07/08 の「editorial・抑制・cinematic globe 廃」方針と相違**する。**homepage の visual は本 doc を優先**（[sir-decided via mockup 2026-06-04]）。docs/04 の色 / font lock との相違は §7 で個別に扱う（sir 確認事項）。
- 役割: **Claude=本 doc を確定 → Codex=実装 → sir=目視ジャッジ**。Claude / Codex は src を勝手に方向転換しない。

---

## 1. モデル（見本）＝ どの画像を「正」とするか

| 見本 | ファイル | 役割 |
|---|---|---|
| **HERO の正** | `design/reference/02_hero-model.png`（= sir 提示 Image#4） | hero 1 画面の**最終見本**。構成・トーン・要素はこれに合わせる |
| **全体の正** | `design/reference/01_full-page-mockup.png` | hero 以下の section（内容・並び・雰囲気）の見本 |

- **pixel 完全一致でなく「構成・トーン・要素」を再現**する（写真は同一、文字は別フォントになる前提）。
- 迷ったら **02_hero-model.png を正**とする。

---

## 2. 使う画像（アセット）＝ どれを背景に使うか

| アセット | ファイル | 使い方 |
|---|---|---|
| **hero 背景（文字なし）** | `design/reference/hero-bg-clean.png` | hero の `background-image`。最適化して `public/images/hero-bg.webp`（+ AVIF/fallback）に配置 |

- **重要**: `01` / `02` の mockup は **文字・UI が写真に焼き込まれた完成画**。**背景に使えるのは `hero-bg-clean.png`（文字なし版）だけ**。
- **見出し・ロゴ・4 機能帯・チャット UI は全部コードで実装**（写真に焼かない）。理由＝**多言語 / レスポンシブ / SEO / 可読性**。
- AI 生成画像である点は docs/04「AI 生成画像は使わない」と相違 → **今回は sir が hero に採用済**（[sir-decided 2026-06-04]）。本番で実写へ差し替える余地は残す（`hero-bg.webp` を差し替えるだけで済む構造に）。

---

## 3. 作るもの — Section 構成（IA）

```
┌─ §1 HERO（1 画面で完結・最重要）──────────────────────┐
│ ▲Andes Inc.                                      ≡    │
│  Making                                               │
│  Global Commerce            （背景＝写真：地球/夜明け/人）│
│  Autonomous.（赤）                                     │
│  —                                                    │
│  人ではなくAIが取引する時代へ。                         │
│  Andesは決済・物流・規制を統合し…                       │
│ ───────────────────────────────────────────────────── │
│ 🧠AI Agents │💳Payments │🚚Logistics │🛡Compliance      │ ← hero 内の下帯
└───────────────────────────────────────────────────────┘
        ↓ ここから「別物」＝重ねない
┌─ §2 OUR PRODUCT（別 section・dark）───────────────────┐
│ OUR PRODUCT / AIがつなぐ、新しい商取引体験。            │
│ [中南米市場の今（数値カード）]  │  [AI チャット UI モック] │
└───────────────────────────────────────────────────────┘
┌─ §3 HOW IT WORKS（別 section・dark）──────────────────┐
│ Agentic Commerceの仕組み  発見→提案→購入→処理→配送      │
└───────────────────────────────────────────────────────┘
```

> mockup 最下部の「POWERED BY」4 機能は **§1 hero の下帯に移設済**（独立 section は作らない）。

### §1 HERO（詳細スペック）

| 要素 | 仕様 |
|---|---|
| 全体 | 全幅・`min-height: 92–100vh`、`flex-direction:column`。背景＝`hero-bg.webp`（`cover` / `position:top center`） |
| header | 左: ロゴ ▲（Crimson 三角）＋ `Andes Inc.`（テキスト）／右: ハンバーガー。hero 上に重ねる（transparent） |
| 見出し H1 | **serif**、3 行 `Making` / `Global Commerce` / `Autonomous.`。**`Autonomous.` のみ Crimson**。短い赤 rule（幅 ~38px）を下に |
| sub | lead 1 行（やや大）＋ 2 行（§6 copy）。最大幅 ~34ch、左寄せ |
| 可読性スクリム | **左→右の暗グラデ**（見出し域を暗く）＋ 上部に軽い暗。背景の太陽光に文字が負けないため必須 |
| 下帯（4 機能） | `AI Agents / Payments / Logistics / Compliance`。各＝アイコン＋ラベル＋1 文。**縦罫線＋Crimson dot** で区切り、下に暗スクリム |
| 境界 | **hero はここで閉じる**。§2 と**重ねない**（前プロト失敗点） |

### §2 OUR PRODUCT（別 section・dark・2 カラム）

- 左カラム: eyebrow `OUR PRODUCT` → H2「**AIがつなぐ、新しい商取引体験。**」→ リード文 → **数値カード「中南米市場の今」**（数値は §6）。
- 右カラム: **AI チャット UI モック**（`AI Shopping Assistant` の会話: 要望→商品カード→`Looks good. Buy it.`→`Order Confirmed`）＋ **商品詳細カード**。
- チャットの商品例（白 T シャツ / ¥3,480 / São Paulo / 5–7 days）は**説明用 placeholder**。実データではない旨をコメントで明記。

### §3 HOW IT WORKS（別 section・dark）

- eyebrow `HOW IT WORKS` → H2「**Agentic Commerceの仕組み**」→ 5 ステップ（`1 発見 / 2 提案 / 3 購入 / 4 処理 / 5 配送`、点線矢印で連結）→ まとめカード「国境を越えた取引を、AIがあたりまえに。**Agentic Commerce.**」。

---

## 4. スタック / 規約（AGENTS.md lock を厳守）

- **React 19 + Vite 6 + Tailwind 4 + Motion(`motion/react`) + TS strict / pnpm / Vercel static**。
- **前提（Phase 0）**: 旧 Next.js `src/` を `_old/old-src/` へ退避 → Vite を scaffold（`react-router-dom` / `react-i18next`）。詳細は AGENTS.md「Stack / Folder」＋ memory `project_stack-lock-2026-06-04`。**本 doc の実装はこの scaffold 後**。
- 文言は**全て** `src/i18n/locales/{ja,en,pt-BR}.json`、**ハードコード禁止・3 locale 同時更新**。
- 色は Tailwind v4 `@theme` トークン定義、**hex 直書き禁止**。
- `import alias @/*`、`named export`、`any` 禁止（`unknown` + type guard）。
- **done の定義**: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全部緑。

---

## 5. デザイントークン（このページ用）

### 色
- 背景写真が暖色を持ち込むので、**UI は warm-dark で受ける**。
- token（`@theme` に定義）:

| token | 値 | 用途 |
|---|---|---|
| `--color-navy` | `#0F1B3D` | brand 紺（footer / 締め） |
| `--color-crimson` | `#C8102E` | **brand 赤＝見出しの赤 / CTA / dot**（唯一の赤） |
| `--color-paper` | `#FAFAF7` | 反転面 |
| `--color-bg` | `#140F0C` | section 背景（warm dark） |
| `--color-bg2` | `#1B1410` | section 背景・濃 |
| `--color-text` | `#F1EAE0` | dark 上の本文 |
| `--color-muted` | `#B9B1A7` | 補助テキスト |

- ⚠ mockup の `#E0392B`（やや橙寄りの赤）は**写真の暖色**。**text/UI の赤は brand `#C8102E` に統一**する。

### Typography
- **H1 = serif display**（cinematic editorial）。OSS で多言語安全な候補: **Source Serif 4 / Fraunces / Lora**（最終 sir 選定）。日本語 = **Noto Serif JP**。
- **UI / body = sans**（Noto Sans JP ＋ Geist 系。**Inter は避ける**＝docs/07）。
- 数値 / 注文 ID / コードは **monospace**。
- ⚠ docs/04 は「全 sans・serif 不使用」→ **hero H1 のみ serif** は相違（§7-5）。

### Motion（Motion 一本・規律は docs/04・design/motion-kit に従う）
- hero: H1 を**行/ブロック単位で stagger reveal**（once）／4 機能帯 fade+rise（once）。
- §2 数値: in-view で count（once、`@number-flow/react` 可）。
- **`useReducedMotion()` 必達**（静的終端へスナップ）、`transform`/`opacity` 限定、**hero を LCP にしない**。
- budget: 動く主役 ≤3 section、1 画面 1 主役。

---

## 6. 文言（3 locale・キーは Codex が設計）

> 全て `src/i18n/locales/*.json` に。下記は ja を正、en / pt-BR も同時作成。

### §1 HERO
- **H1（全 locale 共通・英語のまま）**: `Making` / `Global Commerce` / `Autonomous.`
- sub:
  - ja: 「人ではなくAIが取引する時代へ。」/「Andesは決済・物流・規制を統合し、Agentic Commerceを中南米で実現します。」
  - en: “Commerce where AI transacts, not people.” / “Andes unifies payments, logistics, and compliance to bring Agentic Commerce to Latin America.”
  - pt-BR: “Uma era em que a IA negocia, não as pessoas.” / “A Andes integra pagamentos, logística e compliance para levar o Agentic Commerce à América Latina.”
- 4 機能（ラベルは英語のまま／説明を localize）:
  - **AI Agents** — ja「AIエージェントが発見・比較・提案・購入までを自律的に実行。」
  - **Payments** — ja「国や通貨を越えた、シームレスで安全な決済基盤。」
  - **Logistics** — ja「中南米全域をカバーする、スマートな物流ネットワーク。」
  - **Compliance** — ja「各国の規制・税制・法制度に対応する、統合コンプライアンスエンジン。」

### §2 / §3
- §2 H2「AIがつなぐ、新しい商取引体験。」／ §3 H2「Agentic Commerceの仕組み」など、mockup の文言を ja 正として 3 locale 化（Codex が en/pt-BR 作成、Claude が後で校閲）。

### 数値 — **[verified] のみ使用**（mockup の placeholder は使わない）
mockup: `6.4億人 / $1.6兆 / 20%+` → ❌ placeholder。**下記に置換**（出典: docs/01・memory `domain-and-numbers` [verified 2026-05-29]）:

| 数値 | 意味 | 出典 |
|---|---|---|
| **6.6 億人** | 中南米人口 | World Bank |
| **US$ 7,690 億** | 中南米 EC 市場 | PCMI |
| **2.1 億人** | ブラジル人口 | IBGE |
| **1.7 億人** | PIX 利用者 | ブラジル中銀 |

→ §2「中南米市場の今」カードは上記から **3 つ**（例: 6.6 億人 / US$7,690 億 / 1.7 億人）＋**出典明記**。**「20%+ 成長」は一次ソース無 → 出さない**（要るなら一次ソース確定後）。
→ public NG（出さない）: 北極星 / 中南米の王 / $1T 生表現 / PRC 唯一・24 ヶ月先行 / Series A 機密（CLAUDE.md）。

---

## 7. ⚠ 既存 docs との相違（**sir 確認事項**）

> mockup が docs/04/07/08 の lock と相違する点。**4・5・6 は sir の yes/no が欲しい**。決まり次第、Claude が docs/04/07/08 を更新してから本実装に進む。

| # | 項目 | docs の規定 | mockup | 今回の扱い | tag |
|---|---|---|---|---|---|
| 1 | hero 演出 | editorial・抑制（07/08） | cinematic 写真 hero | **cinematic 採用** | [sir-decided via mockup] |
| 2 | 写真 | AI 生成 NG（04） | AI 生成 hero | 今回採用・本番実写差替余地 | [sir-decided] |
| 3 | globe | 物理 globe 不使用（04） | globe あり（写真内） | 写真の一部として可 | [sir-decided] |
| 4 | 配色 | Navy base＋白 dominant（04/07） | warm dark | **cinematic section は warm-dark 許可・Crimson #C8102E は維持** | [hypothesis 要確認] |
| 5 | font | 全 sans・Inter 可（04） | serif 見出し | **hero H1 のみ serif・UI は sans/Inter 回避** | [hypothesis 要確認] |
| 6 | 赤面積 | pin-point 1–3%（04/07） | 赤やや多め | **Crimson に統一しつつ面積は抑制** | [hypothesis 要確認] |
| 7 | 数値 | 4 マクロ [verified] | placeholder | **verified に置換** | [verified 優先] |

---

## 8. PASS（hero done の定義）

- [ ] §1 hero が **1 画面で完結**し、§2 と重なっていない。
- [ ] 見出し・ロゴ・4 機能帯・チャットは**本物テキスト/コード**（写真に焼き込んでいない）。
- [ ] 背景は `hero-bg.webp`（差し替え可能）。可読性スクリムで H1 が読める。
- [ ] 文言は 3 locale（ja/en/pt-BR）、ハードコードなし。数値は **[verified]** のみ・出典付き。
- [ ] 赤は **Crimson `#C8102E` のみ**（mockup の #E0392B は使わない）。hex 直書きなし（`@theme` トークン）。
- [ ] motion は Motion 一本・budget 内・`reduced-motion` 静的終端。hero は LCP でない。
- [ ] `lint && typecheck && test && build` 緑。
- [ ] Claude の §1→§3 diff レビュー通過 → sir 目視 OK。

---

## 参照
- 見本/アセット: `design/reference/`（01_full-page-mockup / 02_hero-model / hero-bg-clean）
- 数値/法人: `docs/01_company-info.md` ／ stack: `AGENTS.md` ／ motion: `docs/04`・`design/motion-kit/`
- ⚠ docs/07・08 の editorial 方針は §7 の通り本 doc が homepage visual を上書き（要 docs 更新）
