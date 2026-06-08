# Codex /goal prompt — Andes corporate site

> sir はこのファイルの本文を Codex の `/goal` に貼り付けて発動する。
> Phase 0 → 10 を順次達成。各 phase 完了で sir 視覚承認を受ける。

---

## 貼り付け本文（以下を Codex /goal に渡す）

```
Build the Andes Inc. corporate website per the design SSOT in this repo:

- docs/04_brand.md v2.1       palette / typography / motion / dark inversion 規範
- docs/05_pages-spec.md v2    全 6 page IA + copy yaml + i18n key
- docs/07_codex-handoff.md    本書の詳細 phase plan、Stack、Tailwind v4 設定、Accept criteria
- design/wireframes.md v2     全 page の ASCII wireframe + Header sticky 挙動
- design/stripe-shopify-patterns.md  Stripe / Shopify から抽出した pattern library
- messages/{ja,en,pt-BR}.json 全 i18n key 完備（168 key × 3 言語）
- AGENTS.md                   実装規律（stack / convention / Don't）
- .agents/skills/hallmark/    anti-AI-slop design skill、各 page emission 前に self-critique

Stack: Next.js 15 App Router / React 19 / TypeScript strict / Tailwind v4 /
       next-intl / Framer Motion / Resend / zod / pnpm

Constraints:
- 3 locales (ja / en / pt-BR)、ja default
- Light base + dark inversion for /businesses and /careers
- 紺 #0F1B3D / 白 #FAFAF7 / Ink #0A0A0A / Crimson #C8102E
- Fonts: Geist (display) + Inter (body) + Noto Sans JP (日本語) all-sans
- Domain: andes.global (production)
- 数値表示は「5 億人」のみ、subtitle 内で前面化（stats row component 廃止）
- 「北極星」NG → 「向かう先」
- 商社 references NG（三井 / 三菱商事 / NYK 等）、Stripe / Shopify / Anthropic 系のみ

Execute Phase 0 through Phase 10 from docs/07_codex-handoff.md in order.
Check in with sir at the end of each phase via appshot + browser annotation.
Use side chat for spot fixes without halting the main thread.
Run hallmark audit before completing Phase 8 polish.
Deploy preview to Vercel each phase, sir approves visually before next phase.
```

---

## sir が Codex 内でする操作

```
1. 本 repo を Codex に開かせる
2. /goal を起動、上記「貼り付け本文」を input
3. Codex が Phase 0 (Scaffold) から走り出す
4. Phase 完了ごとに preview URL or appshot を sir に出す
5. sir 視覚承認 → 次 Phase / 修正必要 → side chat で指示
6. Phase 10 完了 → production deploy
```

---

## sir 向け チェックポイント

各 phase の sir 確認軸（docs/07 accept criteria の要約）:

```
Phase 0  pnpm dev で http://localhost:3000 が起動する
Phase 1  /ja /en /pt-BR が解決、Header が hero 上で透明 → scroll で白 swap
Phase 2  Top hero copy が「Agentic Commerce のための LATAM infrastructure。」
         subtitle に「5 億人」、stats row なし、2 層構造図 + map 1 線
Phase 3  About vision = 「向かう先」（北極星 NG）、2 layer card + Phase timeline
Phase 4  Businesses が dark surface、Layer ①/② tag、5 領域 icon grid
Phase 5  Careers が dark surface、hero「LATAM の AC を、誰と建てるか。」
Phase 6  Press = press.stripe.com 抑制、IVS 京都 2026 表示
Phase 7  Contact form が Resend 経由で 4 alias へ送信
Phase 8  Lighthouse 95+ × 4、axe-core 0 violation、Hallmark audit pass
Phase 9  3 locale 完備、欠落 key で CI fail
Phase 10 Vercel preview → sir 視覚承認 → andes.global production deploy
```

---

## 後追いで sir が用意するもの（実装ブロックしない）

```
[ ] Logo SVG（slide からトレース、実装中は placeholder で進行可）
[ ] 写真 asset（ブラジル現地 / J-Planet catalog、placeholder 進行可）
[ ] Email alias 受信フロー（誰が見る・SLA、運用開始時に確定）
```

---

## 連絡

- Claude（設計担当）の連絡: Andes-Website repo 内 docs/ を更新
- Codex（実装担当）への redirect: 本 repo の docs/04 + docs/05 + docs/07 + AGENTS.md
- sir の operation: /goal で Codex を起動、appshot / browser annotation で feedback
