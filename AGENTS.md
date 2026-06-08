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
- client 公開可は `NEXT_PUBLIC_*` のみ
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
- [agents.md](https://agents.md/) / [Next.js](https://nextjs.org/docs/app) / [next-intl](https://next-intl.dev/)


<claude-mem-context>
# Memory Context

# [Andes-Website] recent context, 2026-06-04 1:16pm GMT-3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (21,763t read) | 1,035,106t work | 98% savings

### May 22, 2026
321 10:24p 🔵 Runtime environment: Node v25.6.1, pnpm 10.12.1, node_modules populated
### May 29, 2026
341 5:32a ✅ Production build and server startup initiated for Hero v4 testing
342 " ✅ Production build completed and server ready on port 3200
343 5:40a ✅ Added maskHeight state to HeroV4 component for chat window clipping
346 5:46a 🔵 ServicesV4 component structure and content
347 " 🔵 NetworkV4 component structure — interactive SVG network diagram
349 6:00a 🔵 Design reference documentation inventory for Andes v4
350 " 🔵 Stripe/Shopify pattern trace document — full design reference loaded for v4
351 6:06a 🔵 Stripe /en-br full page structure — 8 distinct sections scraped via Firecrawl
352 " 🔵 Sierra.ai full page structure — 6 sections with Agent OS product emphasis, not just hero animations
S263 Andes-Website v4 session resume — status briefing with no new work yet (May 29 at 6:08 AM)
### Jun 1, 2026
S264 Lazyweb MCP capability discovery for Andes-Website v4 design research (Jun 1 at 3:15 PM)
S262 Andes-Website v4 progress check — status review and next step selection (Jun 1 at 3:15 PM)
407 3:16p 🔵 Lazyweb MCP integration confirmed healthy for Andes-Website design research
408 " ⚖️ Andes-Website v4: 7-dimension parallel design research workflow launched
S266 Ambiguous follow-up "ほかにもありませんでしたっけ？" — clarification requested before proceeding (Jun 1 at 3:16 PM)
### Jun 2, 2026
S267 Recording "Codex owns reproduction" role division — Claude measures/specs, Codex rebuilds (Jun 2 at 3:17 AM)
S265 User asked "ほかにもありませんでしたっけ？" (Weren't there others?) — ambiguous reference needing clarification (Jun 2 at 3:17 AM)
409 3:20a ⚖️ Codex owns reproduction implementation; Claude owns measurement and spec
S270 Animation stack finalized with Claude's own editorial picks — waiting for sir-decide on hero fluid before writing docs/09 (Jun 2 at 3:20 AM)
410 3:25a 🔵 Andes Website full dependency stack confirmed
411 " 🔵 GSAP SplitText now free — all premium plugins unlocked without license restriction
412 " 🔵 Animation library license and maintenance audit — split-type is stale, react-bits license unclear
413 " 🔵 GSAP useGSAP + ScrollTrigger integration pattern for Next.js confirmed
414 3:26a 🔵 Library license audit: paper-design/shaders and LYGIA are NOT safe for commercial use
415 " 🔵 Animated number component: @number-flow/react confirmed MIT, 743k weekly downloads
416 " 🔵 GSAP license is NOT MIT — custom proprietary "No Charge" license, safe for Andes but not OSI
417 " 🔵 Motion splitText is paywalled (Motion+); react-bits has Commons Clause; use-scramble is active
418 " 🔵 Animation library audit complete — safe vs unsafe shortlist for Andes Website
419 3:27a 🔵 three-fluid-fx confirmed MIT — cursor-driven fluid simulation, R3F-compatible, 13KB gzipped
420 " 🔵 @studio-freight/react-lenis officially deprecated; npm weekly download comparison for animation libs
421 " 🔵 drei material helpers confirmed: GradientTexture, shaderMaterial, MeshWobbleMaterial, MeshTransmissionMaterial all MIT
422 3:28a 🔵 Scroll-driven animation de-facto stack confirmed: Lenis + GSAP ScrollTrigger + @gsap/react
423 " 🔵 Hero text reveal de-facto: GSAP SplitText; MIT alternative is split-type + framer-motion staggerChildren
424 " 🔵 Magic UI NumberTicker uses motion/react (useMotionValue, useSpring, useInView); AnimatedBeam uses motion SVG
425 3:29a ⚖️ WebGL background shader stack decided: drei GradientTexture/shaderMaterial as base + three-fluid-fx for hero
426 " ⚖️ UI animation component decisions: @number-flow/react for counters; Magic UI AnimatedBeam for agent diagram; motion for flow lines
S268 Animation library research for Andes Website — comprehensive 4-domain audit (scroll, text reveal, WebGL shaders, diagram/counter) (Jun 2 at 3:29 AM)
S269 Animation library URL catalog compiled for visual review — user asked "ほかにもありませんでしたっけ？" leading to full 4-domain animation stack summary with live demo links (Jun 2 at 3:29 AM)
S271 Animation stack editorial selection complete — Claude proposed confirmed picks, 1 new package, and 1 sir-decide; awaiting direction to write docs/09 and save memory (Jun 2 at 3:30 AM)
429 4:20a 🔵 Andes-Website Animation Stack — Full Technical Inventory
430 4:22a 🔵 HeroV3 Revolut-Style Scroll Animation — Full Mechanism Detail
431 " 🔵 Hallmark Design Skill System in .agents/skills/hallmark/
432 4:23a 🔵 Global Agent Skill Ecosystem for Andes-Website Context
434 " ⚖️ Animation Showcase Site Planned as Separate Materials Library
433 4:24a 🔵 Recent File Activity — Active Development Today + Hallmark Symlink Structure
435 4:38a 🔵 Andes-Website Complete Color Token + Animation Token System — Confirmed from globals.css
436 " 🔵 Animation-Kit Components — Implementation Details of AnimatedBeam and NumberTicker
437 4:40a 🟣 Animation Vault Preview Route — Implementation Plan Created
438 " 🔵 zsh Glob Expansion Blocks mkdir for Next.js [locale] Dynamic Route Paths
439 " 🟣 Animation Vault Route and Component Directories Created
440 4:41a 🟣 AnimatedBeam Component Created with Andes Brand Colors
441 " 🟣 NumberTicker Component Created with Locale Support and Reduced-Motion Fix
442 " 🟣 Particles Component Rewritten with CSS Token Color + Reduced Motion Support
### Jun 4, 2026
492 12:07p ⚖️ Andes Corporate Site: Next.js → Vite 6 Migration Decision
493 " ⚖️ Andes Hero Section: Cinematic Implementation Requirements
494 " 🔵 Andes Website: No Prior Memory Found for Project
495 " ⚖️ Andes Homepage: TDD-First Implementation Plan Established
496 " 🔵 Andes-Website: Current Repo Is Still Full Next.js (Not Yet Migrated)
497 " 🔵 Andes Brand: Verified Numbers and Color Tokens for Homepage

Access 1035k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>