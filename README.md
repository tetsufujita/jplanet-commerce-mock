# Andes Corporate Site

> Andes Inc.（日本親会社） / Andes BR / J-Planet グループの公式コーポレートサイト
> **設計 = Claude Code / 実装 = Codex** の分業構成
> 3 言語（ja / en / pt-BR）静的 SPA

---

## Stack（★固定 2026-06-04・sir 確定）

| Layer | 採用 |
|---|---|
| Framework | React 19 + Vite 6（static SPA） |
| Language | TypeScript strict（`any` 禁止） |
| Style | Tailwind CSS v4（`@theme` トークン、ハードコード hex 禁止） |
| Animation | **Motion（`motion/react`）一本**（GSAP / Lenis / Three / Remotion は不使用） |
| Router | react-router-dom |
| i18n | react-i18next（ja / en / pt-BR） |
| Icon | lucide-react |
| Form | Resend + zod（実装は後、CTA は当面 mailto） |
| Deploy | Vercel（static） |
| Pkg mgr | pnpm |

> ⚠ **Next.js / next-intl は不採用**（2026-06-04 に Vite へ移行）。旧 Next.js 実装は `_old/` に参照用退避。

---

## リポジトリ構造

```
Andes-Website/
├── AGENTS.md          ← 全 AI coding agent 共通 SSOT（実装規律本体）
├── CLAUDE.md          ← Claude Code 専用 thin layer（設計担当）
├── README.md          ← 本ファイル
├── index.html         ← Vite entry
├── vite.config.ts / tsconfig.json / eslint.config.mjs / .prettierrc
├── package.json / pnpm-lock.yaml
├── docs/              ← 設計 SSOT（Claude / 人間が更新、Codex は read-only）
│   ├── 00_index.md            docs 索引（迷ったらまずここ）
│   ├── 01_company-info.md     法人情報（住所 / CNPJ / 代表）
│   ├── 02_business-model.md   北極星 + 2 層戦略 + Phase
│   ├── 03_services.md         事業 portfolio（J-Planet / J-Vita）
│   ├── 04_brand.md            ブランド・配色・タイポ・トーン
│   ├── 05_pages-spec.md       各ページ要件 + i18n key
│   ├── 06_team.md             チーム
│   ├── 07_homepage.md         homepage 構成 決定版（8 section IA）
│   ├── 08_requirements.md     要件定義（発注書・確定）
│   └── 10_agentic-workflow.md 二刀流 BP（Codex タスクテンプレ / done 定義）
├── design/
│   ├── motion-kit/            効果の処方箋（tokens / s1-s5 / _rejected）
│   ├── reference/             参考サイト
│   └── research/              作り方 playbook（reset 2026-06-04 後）
├── src/               ← 実装（Codex）
│   ├── App.tsx / main.tsx
│   ├── pages/                 各ページ
│   ├── components/sections/   §1–§8 section
│   ├── i18n/locales/          ja / en / pt-BR.json（react-i18next）
│   └── styles/globals.css     Tailwind v4 entry
├── public/            ← 静的 asset（images / video）
├── tests/             ← vitest（unit）
├── _old/              ← 旧 Next.js 実装・過去探索（参照のみ・不採用）
└── .claude/           ← Claude Code plugin 引継
```

---

## 役割分担

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│       Claude Code           │         │           Codex             │
│       （設計担当）           │         │        （実装担当）           │
│                             │ → docs  │                             │
│  - sir と対話して docs/ 更新 │         │  - AGENTS.md を読む          │
│  - design/ motion-kit 更新  │         │  - docs/ を read-only 参照   │
│  - i18n locales base        │         │  - src/ に実装               │
│  - 戦略 / コンセプト判断      │         │  - tests 書く                │
│                             │         │  - lint / build / deploy    │
└─────────────────────────────┘         └─────────────────────────────┘
```

- **Claude Code は src/ を直接触らない**（設計変更が必要なら先に docs/ を更新）
- **Codex は docs/ を変更しない**（read のみ、矛盾を見つけたら指摘）

---

## はじめかた

```bash
cd ~/Desktop/Andes-Website

claude   # 設計担当として開く → CLAUDE.md + AGENTS.md + docs/01,02 が読まれる
codex    # 実装担当として開く → AGENTS.md の実装規律が適用される
```

## 基本コマンド

```bash
pnpm install            # 依存解決（初回）
pnpm dev                # Vite dev → http://localhost:5173
pnpm build              # 本番ビルド → dist/
pnpm preview            # build 後の確認

pnpm lint               # ESLint
pnpm typecheck          # tsc --noEmit
pnpm test               # vitest run
pnpm format             # prettier --write .

# PR 前 mandatory
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

環境変数は `.env.local`（gitignore 済）、template は `.env.example`。

---

## 親プロジェクトとの関係

このサイトの会社情報・戦略の **正典は親プロジェクト** `~/Desktop/Andes-New/` にある。

```
~/Desktop/Andes-New/     ← 親、Andes グループ全体の SSOT（soul / 戦略）
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

- **J-Planet EC**（別 site、GitHub 開発中）: github.com/Shuya313/jplanet
- **J-Vita**（医療 EC、別 vault）: `~/Desktop/j-vita/`
- **Andes-New**（親プロジェクト / wiki / 戦略 SSOT）: `~/Desktop/Andes-New/`
