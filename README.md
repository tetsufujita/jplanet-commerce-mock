# Andes Corporate Site

> Andes Inc.（日本親会社） / Andes BR / J-Planet グループの公式コーポレートサイト
> **設計 = Claude Code / 実装 = Codex** の分業構成

---

## このリポジトリの構造

```
Andes-Website/
├── AGENTS.md         ← 全 AI coding agent 共通 SSOT（実装規律本体）
├── CLAUDE.md         ← Claude Code 専用 thin layer（設計担当）
├── README.md         ← 本ファイル
├── docs/             ← 設計 doc（人間 + Claude が更新、Codex は read）
│   ├── 01_company-info.md     法人情報（住所 / CNPJ / 代表）
│   ├── 02_business-model.md   北極星 + 2 層戦略 + Phase
│   ├── 03_services.md         事業 portfolio（J-Planet / J-Vita）
│   ├── 04_brand.md            ブランド・配色・タイポ・トーン
│   ├── 05_pages-spec.md       各ページ要件 + i18n key
│   └── 06_team.md             チーム紹介
├── design/
│   ├── wireframes.md          各ページの ASCII wireframe
│   └── moodboard.md           参考サイト / 配色 reference
├── messages/         ← next-intl 文言（ja / en / pt-BR）
├── src/              ← Codex が実装
├── public/           ← 静的 asset
└── .claude/
    └── settings.json ← Claude Code plugin 引継
```

---

## 役割分担

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│       Claude Code           │         │           Codex             │
│       （設計担当）           │         │        （実装担当）           │
│                             │ → docs  │                             │
│  - sir と対話して docs/ 更新 │         │  - AGENTS.md を読む          │
│  - design/ wireframe 更新   │         │  - docs/ を read-only 参照   │
│  - messages 翻訳 base       │         │  - src/ に実装               │
│  - 戦略 / コンセプト判断      │         │  - tests / e2e 書く          │
│                             │         │  - lint / build / deploy    │
└─────────────────────────────┘         └─────────────────────────────┘
```

- **Claude Code は src/ を直接触らない**（設計変更が必要なら先に docs/ を更新）
- **Codex は docs/ を変更しない**（read のみ、矛盾を見つけたら指摘）

---

## はじめかた

### 設計担当（Claude Code）として開く

```bash
cd ~/Desktop/Andes-Website
claude
```

→ CLAUDE.md が読まれ、AGENTS.md / docs/01 / docs/02 が自動 import される

### 実装担当（Codex）として開く

```bash
cd ~/Desktop/Andes-Website
codex
```

→ AGENTS.md が読まれ、実装規律が適用される

---

## 基本コマンド

```bash
pnpm install            # 依存解決（初回）
pnpm dev                # http://localhost:3000
pnpm build              # 本番ビルド
pnpm start              # ビルド済みを起動

pnpm lint               # ESLint
pnpm typecheck          # tsc --noEmit
pnpm test               # vitest
pnpm e2e                # playwright

pnpm format             # prettier --write .
```

---

## Stack

| Layer | 採用 |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript strict |
| Style | Tailwind CSS v4 |
| i18n | next-intl（ja / en / pt-BR） |
| Form | Resend API + react-hook-form + zod |
| Animation | Framer Motion（最小限） |
| Deploy | Vercel |
| Pkg mgr | pnpm |

---

## 親プロジェクトとの関係

このサイトの会社情報・戦略の **正典は親プロジェクト** `~/Desktop/Andes-New/` にある。

```
~/Desktop/Andes-New/     ← 親、Andes グループ全体の SSOT
  ├── Company.md
  ├── company/
  ├── soul.md
  └── projects/Agentic_Commerce/  ← 戦略 SSOT

  ↓ snapshot

~/Desktop/Andes-Website/ ← このリポジトリ、サイト用 snapshot
  └── docs/              ← 親から抽出した必要情報のみ
```

親側で数値や住所が変わったら、このリポジトリの `docs/` を反映する形で追従する。

---

## 未確定（sir 判断待ち）

- [ ] ドメイン（andes.global / andes.inc / andes.com.br）
- [ ] ロゴデータ
- [ ] 配色最終確定
- [ ] タイポ最終選定
- [ ] 連絡先メールアドレス
- [ ] チーム紹介の露出度（しゅうや / えりき の bio 公開可否）
- [ ] 写真 source（撮影予定 / 既存 asset）

詳細は `docs/04_brand.md` / `docs/06_team.md` 末尾参照。

---

## 関連プロジェクト

- **J-Planet EC**（別 site、既に GitHub 上で開発中）: github.com/Shuya313/jplanet
- **J-Vita**（医療 EC、別 vault）: `~/Desktop/j-vita/`
- **Andes-New**（親プロジェクト / wiki / 戦略 SSOT）: `~/Desktop/Andes-New/`
