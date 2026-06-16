# AGENTS.md — Andes Website（エンジニアリング規約）

この repo の **絶対ルール**。何を作る場合でも（ページ実装 / 再現 / 実験 / 修正）従う。
プロジェクト固有の文脈・設計 SSOT・役割分担は `CLAUDE.md` と `docs/00_index.md`。

## Stack（★固定・変更不可）

**React 19 + Vite 6 + Tailwind CSS 4 + Motion(`motion/react`) + TypeScript strict** / pnpm / Vercel(static SPA)
- アニメは **Motion 一本**（GSAP / Lenis / Three / R3F / cobe / Remotion / split-type は使わない）。
- router = `react-router-dom` / i18n = `react-i18next`。
- ⚠ **Next.js / next-intl は不採用**。

## Setup

```bash
pnpm install
pnpm dev      # Vite → http://localhost:5173
pnpm build    # → dist/（静的）
pnpm preview  # build 後の確認
pnpm lint && pnpm typecheck && pnpm test && pnpm build  # PR 前 mandatory（全部緑）
```

環境変数は `.env.local`（gitignore 済）、template は `.env.example`。

## Conventions

- TypeScript strict、`any` 禁止（`unknown` + type guard）
- Vite SPA（全て client）。副作用は `useEffect`、アニメは `motion/react`
- import alias `@/*` → `src/*`、`../` 禁止
- 命名: Component `PascalCase` / hook `use*` / util `camelCase`。component は named export
- ユーザー表示文言は `src/i18n/locales/*.json`（react-i18next）に集約、`.tsx` ハードコード禁止。新規 key は全 locale 更新
- Tailwind utility-first、`@apply` は base layer のみ。ハードコード hex 禁止 → `@theme` トークン（ブランド色は `docs/04`）
- 画像は最適化（適切な width / format）、過大な未圧縮画像禁止
- 全アニメで `prefers-reduced-motion` 対応を壊さない

## Folder

- `index.html` / `vite.config.ts` — Vite entry + plugins
- `src/main.tsx` / `src/App.tsx` — React root / router
- `src/pages/` — ルート単位のページ
- `src/components/` `src/i18n/` `src/styles/globals.css`
- `public/` — 静的アセット
- `docs/` — 設計 SSOT（read-only）/ `_old/` — 旧実装（参照のみ・不採用）

## Security

- secret は `.env.local` / Vercel env、commit 禁止。client 公開可は `VITE_*` prefix のみ
- 外部 fetch は server side、API key を client に漏らさない
- フォーム入力は zod で validation、個人情報は DB 保存しない

## Git

- branch `feat/*` `fix/*` `chore/*` `docs/*`
- commit Conventional Commits（`feat:` `fix:` `docs:` `chore:` `refactor:`）

## Don't

- Next.js / next-intl / GSAP / Lenis / Three / Remotion を入れない（**Vite + Motion のみ**）
- 文言 / 数値 / secret のハードコード（i18n / 設計 SSOT / env から引く）
- `default export` 乱用 / `any` / `console.log` 残し / unused import

## Reference

- プロジェクト固有の文脈・設計 SSOT → `CLAUDE.md`, `docs/00_index.md`
- Shopify JP 学習用再現（`/shopify-jp`）→ `src/shopify-jp/README.md`
- [agents.md](https://agents.md/) / [Vite](https://vite.dev/) / [React Router](https://reactrouter.com/) / [react-i18next](https://react.i18next.com/) / [Motion](https://motion.dev/)
