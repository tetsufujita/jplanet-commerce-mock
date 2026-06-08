# AGENTS.md — Andes Corporate Site

Andes Inc. / Andes BR / J-Planet グループ公式コーポレートサイト。3 言語（ja / en / pt-BR）静的サイト。
詳細は `docs/`、ページ要件は `docs/05_pages-spec.md`。

## Stack（★固定 2026-06-04・sir 確定）

**React 19 + Vite 6 + Tailwind CSS 4 + Motion(`motion/react`) + TypeScript strict** / pnpm / Vercel(static SPA)
- アニメは **Motion 一本**（GSAP / Lenis / Three / R3F / cobe / Remotion / split-type は**使わない**）。
- router = `react-router-dom` / i18n = `react-i18next`（next-intl は不使用）/ contact form は後（CTA は当面 mailto）。
- ⚠ **Next.js は不採用**。旧 Next.js コード（`src/`）は `_old/` 行き、Vite で作り直す（Codex の最初のタスク）。

## Setup

```bash
pnpm install
pnpm dev                                                # Vite → http://localhost:5173
pnpm build                                              # → dist/（静的）
pnpm preview                                            # build 後の確認
pnpm lint && pnpm typecheck && pnpm test && pnpm build  # PR 前 mandatory
```

環境変数は `.env.local`（gitignore 済）、template は `.env.example`。

## Conventions

- TypeScript strict、`any` 禁止、`unknown` + type guard
- Vite SPA（全て client）。副作用は `useEffect`、アニメは Motion（`motion/react`）
- import alias `@/*` → `src/*`（vite.config + tsconfig paths）、`../` 禁止
- 命名: Component `PascalCase` / hook `use*` / util `camelCase`
- 文言は **全て** `src/i18n/locales/{locale}.json`（react-i18next）に集約、`.tsx` でのハードコード禁止
- 新規 i18n key は 3 locale 全部更新（ja / en / pt-BR）
- 画像は最適化（`vite-imagetools` 等・適切な width / format）、過大な未圧縮画像禁止
- Tailwind utility-first、`@apply` は `globals.css` の base layer のみ
- ハードコード hex 禁止 → Tailwind v4 の `@theme` トークン定義（Navy #0F1B3D / Crimson #C8102E）

## Folder（Vite）

```
index.html                Vite entry
vite.config.ts            React + Tailwind v4 plugin
src/main.tsx              React root
src/App.tsx               router（react-router-dom）
src/pages/                top / about / businesses / careers / press / contact
src/components/sections/  §1–§8 の各 section
src/components/{ui,motion}/
src/i18n/                 react-i18next + locales（{ja,en,pt-BR}.json）
src/styles/globals.css    Tailwind v4 entry（@import "tailwindcss"）
public/
docs/                     設計 SSOT（Codex は read-only）
_old/                     旧 Next.js 実装・過去の探索（参照のみ）
```

## Security

- secret は `.env.local` / Vercel env、commit 禁止
- client 公開可は `VITE_*` prefix のみ（Vite の公開 env 規約）
- 外部 fetch は server side、API key を client に漏らさない
- お問い合わせ form は zod + server action で validation
- 個人情報は Resend 経由のみ、DB 保存しない

## Git

- branch `feat/*` `fix/*` `chore/*` `docs/*`
- commit Conventional Commits（`feat:` `fix:` `docs:` `chore:` `refactor:`）

## Don't

- Next.js / next-intl / GSAP / Lenis / Three / Remotion を入れない（**Vite + Motion のみ**）
- 文言 / 法人情報 / 数値のハードコード（`src/i18n/locales/*.json` と `docs/01` から引く）
- `default export` 乱用（component は named export）
- `any` / `console.log` 残し / unused import

## Reference

- **`docs/00_index.md` — docs 全体の索引（迷ったらまずここ）**
- `docs/01_company-info.md` — 法人情報 SSOT
- `docs/02_business-model.md` — ビジネスモデル / 翻案ガイド
- `docs/03_services.md` — 事業内容
- `docs/04_brand.md` — ブランド / 色 lock（Crimson #C8102E は pin-point）
- `docs/05_pages-spec.md` — 各 page 要件 + i18n key
- `docs/06_team.md` — チーム
- `docs/07_homepage.md` — ★homepage 構成 決定版（8 section IA / 視覚システム / motion / 参考マッピング）
- `docs/08_requirements.md` — ★要件定義（発注書・確定）。成功指標/トーン(dark推奨)/参照役割/motion方針/進め方/PASS
- `design/motion-kit/` — ★効果の処方箋（00_tokens / s1-s5 / _rejected）。motion はここに従う
- `docs/10_agentic-workflow.md` — 二刀流 BP（Codex タスクテンプレ / `/review` / done の定義）
- `design/research/` — 作り方 playbook ＋ 参考サイト（reset 2026-06-04 後の fresh research）
- ⚠ 旧物（Next.js src・旧 design 探索 09/11/12・audit 等）は **`_old/`**（参照のみ・不採用）。
- [agents.md](https://agents.md/) / [Vite](https://vite.dev/) / [React Router](https://reactrouter.com/) / [react-i18next](https://react.i18next.com/) / [Motion](https://motion.dev/)
