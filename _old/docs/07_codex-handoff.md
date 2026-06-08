---
title: Codex 実装ハンドオフ
date: 2026-05-22
updated: 2026-05-22
status: handoff-ready
tags: [handoff, codex, implementation, ssot]
purpose: Codex /goal mode に直接食わせられる、Andes corporate site の実装指示書
---

# 07 Codex 実装ハンドオフ

> **本 doc は Codex の `/goal` mode に渡す入力**として書かれている。
> Codex はこれを上から下まで読み、Phase 0 → 10 を順次達成する。
> Claude（設計担当）がこの doc を更新したら、sir が Codex に再 inject する。

---

## Mission（/goal に渡す 1 文）

```
Build the Andes Inc. corporate website per docs/04 v2.1 + docs/05 v2 +
design/wireframes.md v2, using Next.js 15 App Router + next-intl + Tailwind v4 +
Resend, in 3 locales (ja / en / pt-BR), with light base + dark inversion for
Businesses/Careers pages, following the Stripe-Shopify pattern library at
design/stripe-shopify-patterns.md.
```

---

## Read order（実装前 must）

```
1. AGENTS.md                          実装規律（stack / convention / Don't）
2. docs/01_company-info.md            会社情報 SSOT（住所 / CNPJ / 代表 等）
3. docs/02_business-model.md          ビジョン / 戦略（公開可 framing）
4. docs/04_brand.md  v2.1             palette / typography / motion / inversion
5. docs/05_pages-spec.md  v2          各 page IA + copy 日本語 base + i18n key
6. design/wireframes.md  v2           ASCII wireframe（全 6 page + Header / Mobile）
7. design/stripe-shopify-patterns.md  Hero / Nav / Color / Stats の具体 pattern
8. design/moodboard-references.md     ⚠️  参考研究記録、ただし Round 2/3（商社系）は
                                       採用しない。docs/04 v2.1 に従う
9. messages/{ja,en,pt-BR}.json        Phase 1 で Claude が用意する copy bundle
10. .agents/skills/hallmark/SKILL.md   anti-AI-slop design skill、UI quality 担保
```

---

## Stack（AGENTS.md と同期、追加事項あり）

```
Next.js 15 (App Router)        framework
React 19                       UI
TypeScript strict              type
Tailwind v4                    CSS（@theme で CSS variable 定義）
next-intl                      i18n（ja / en / pt-BR）
Framer Motion                  motion（hero diagram / hover のみ）
Resend                         contact form 送信
zod                            form validation
Vercel                         deploy（preview deploy 必須）
pnpm                           package manager
```

### Tailwind v4 設定

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Light base */
  --color-andes-navy:    #0F1B3D;
  --color-andes-paper:   #FAFAF7;
  --color-andes-ink:     #0A0A0A;
  --color-andes-crimson: #C8102E;

  /* Gray scale */
  --color-gray-50:  #F5F4F0;
  --color-gray-100: #E8E6E0;
  --color-gray-300: #B8B5AC;
  --color-gray-500: #6E6B65;
  --color-gray-700: #3D3B36;
  --color-gray-900: #1A1917;

  /* Dark inversion */
  --color-andes-deep:    #060B1F;
  --color-andes-subtle:  #4A5066;
  --color-andes-glow:    #E83E5C;

  /* Fonts */
  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-jp:      "Noto Sans JP", ui-sans-serif, system-ui;

  /* Easing */
  --ease-andes: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Phase 0 — Scaffold + Tooling

### Goal
プロジェクト雛形と CI / lint / typecheck / test の足回りを揃える。

### Steps

```bash
# 1. Next.js scaffold
pnpm create next-app@latest . --typescript --app --tailwind --src-dir \
  --import-alias "@/*" --use-pnpm

# 2. Core deps
pnpm add next-intl framer-motion resend zod

# 3. Dev deps
pnpm add -D @types/node prettier eslint-config-next vitest @testing-library/react

# 4. 環境変数 template
# .env.example を copy → .env.local（既存 .env.example を使用）
```

### Outputs

```
package.json
tsconfig.json (strict: true)
next.config.ts
tailwind.config.ts
src/app/layout.tsx
src/app/page.tsx                  ← 後で /[locale]/page.tsx に移行
.eslintrc / .prettierrc
.env.example                      ← 既存維持
```

### Accept

```
✓ pnpm dev で http://localhost:3000 が起動する
✓ pnpm lint && pnpm typecheck && pnpm build がすべて pass
✓ pnpm test で minimal smoke test pass
```

---

## Phase 1 — Foundation（i18n + theme + Header/Footer）

### Goal
全 page 共通の layout、i18n routing、palette / typography token、Header / Footer / LangSwitcher を実装。

### Steps

```
1. src/i18n/routing.ts                next-intl 設定、locales = [ja, en, pt-BR]、default = ja
2. src/app/[locale]/layout.tsx        共通 layout、Header + Footer + Provider
3. src/app/[locale]/page.tsx          Top page の skeleton（Phase 2 で中身）
4. src/components/layout/Header.tsx   sticky 透明 → 白 swap、LangSwitcher、mobile hamburger
5. src/components/layout/Footer.tsx   4 column、bilingual switcher
6. src/components/ui/LangSwitcher.tsx 3 言語 dropdown
7. src/components/ui/Button.tsx       primary 紺 filled / secondary outline
8. messages/{ja,en,pt-BR}.json        共通 key（nav / footer / common）を ja 完備、en/pt-BR 翻訳
9. src/app/globals.css                @theme で token 定義、base reset
```

### Header 挙動仕様（Shopify pattern）

```ts
// Header.tsx pseudo
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDarkPage = pathname.includes('/businesses') || pathname.includes('/careers');

  // scroll 観測
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 状態:
  // - dark page: 常時 dark BG + Paper 文字
  // - 通常 page + scroll=0: 透明 BG + Paper 文字（hero に重なる）
  // - 通常 page + scroll>64: 白 BG + Ink 文字（300ms ease）
}
```

### Accept

```
✓ /ja → /ja/, /en → /en/, /pt-BR → /pt-BR/ が解決する
✓ LangSwitcher で同じ path のまま locale だけ変わる
✓ Header が hero 上で透明、scroll で白 swap（300ms ease）
✓ Businesses / Careers では常時 dark surface
✓ mobile（375px）で hamburger 開閉動作
✓ messages/*.json で 3 locale 完備、欠落 key で CI fail
```

---

## Phase 2 — Top page (/[locale]/)

### Goal
Hero + Why now + Portfolio + Group structure + Footer CTA を `docs/05` v2 + `design/wireframes.md` v2 通りに実装。
※ stats row は廃止（sir-decided 2026-05-22）、5 億人は subtitle で前面化のみ。

### Steps

```
1. src/components/sections/Hero.tsx           Top 用、2 CTA + 右側 SVG diagram + map 1 線
2. src/components/sections/WhyNow.tsx         3 card grid
3. src/components/sections/Portfolio.tsx      3 card with Layer tag
4. src/components/sections/GroupStructure.tsx ASCII / SVG 構造図
5. src/components/sections/FooterCTA.tsx      対話を始める
6. src/components/visuals/TwoLayerDiagram.tsx SVG、line draw animate（once、800ms）
7. src/components/visuals/JapanBRMap.tsx      SVG、Tokyo→São Paulo arc animate（once、1200ms）
```

### Hero diagram 仕様

```
SVG component、viewBox 480×400
─────────────────────────────
- Layer ① box（top）: stroke #FAFAF7（dark BG 用）or #0F1B3D（light BG 用）
- Layer ② box（mid）: 同上
- 矢印 ↓ で 2 box 接続
- box 内に短文「購入エージェント」「プラットフォーム」
- load 時に stroke-dashoffset → 0 で line draw（800ms、ease-andes）
- prefers-reduced-motion: 即時表示、animate skip
```

### Map 仕様

```
SVG component、viewBox 800×400
─────────────────────────────
- Japan 大陸 silhouette（左）
- South America 大陸 silhouette（右）
- Tokyo dot（#C8102E）+ São Paulo dot（#C8102E）
- arc line で 2 点接続、curve は上向き
- load 時に arc を stroke-dashoffset 描画（1200ms）
- prefers-reduced-motion: 即時表示
```

### Accept

```
✓ Hero copy が docs/05 v2 home.hero.* と一致（3 locale）、subtitle に「5 億人」明記
✓ Why now 3 card、hover で 4px 上昇 + shadow
✓ Portfolio 3 card に Layer tag 表示、card click で各事業 link
✓ Group structure 図 ASCII / SVG どちらでも可、key info 載っていれば OK
✓ Footer CTA → /contact link
✓ Lighthouse Performance > 90 / Accessibility > 95
✓ sir 視覚承認（appshot 経由）
```

---

## Phase 3 — About (/[locale]/about)

### Goal
向かう先 + 2 layer + Phase roadmap + Team + Group structure を `docs/05` v2 通りに実装。

### Steps

```
1. src/app/[locale]/about/page.tsx
2. src/components/sections/Vision.tsx          向かう先（旧 NorthStar、key rename）
3. src/components/sections/TwoLayer.tsx        2 box 詳細版、SVG 連結図
4. src/components/sections/PhaseRoadmap.tsx    横長 timeline、5 step
5. src/components/sections/Team.tsx            3 card（sir / しゅうや / えりき）
6. src/components/sections/GroupStructureDetail.tsx
```

### Accept

```
✓ Vision copy が about.vision.* と一致、「北極星」の語が外部出力に出ない
✓ 2 layer は SVG で 2 box + 矢印、scroll-in で line draw
✓ Phase roadmap 5 step（Phase 1-4 + endgame）、横長 timeline
✓ Team card 3 名、写真 placeholder or initial avatar
✓ sir 視覚承認
```

---

## Phase 4 — Businesses (/[locale]/businesses)  ⚫ dark inversion

### Goal
Andes の Agentic Commerce 実装 hero + 3 事業 section + 5 領域 icon grid を **dark surface** で実装。

### Dark inversion 実装

```ts
// src/app/[locale]/businesses/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="bg-andes-navy text-andes-paper min-h-screen">{children}</div>;
}

// または data-theme="dark" を root に置き、CSS variable を invert
```

### Steps

```
1. src/app/[locale]/businesses/page.tsx       dark layout、Modal pattern
2. src/components/sections/BusinessHero.tsx   dark hero、Layer 説明
3. src/components/sections/JPlanetSection.tsx tag + 2 col + bullets（数値表示なし）
4. src/components/sections/JVitaSection.tsx
5. src/components/sections/ProtocolSection.tsx
6. src/components/sections/CapabilityIcons.tsx 5 領域 icon grid（SVG stroke、Paper color）
7. src/components/ui/Tag.tsx                   Layer ①/② tag chip
```

### 5 領域 icon

```
商品提案 / 規制対応 / 越境決済 / 簡易通関 / 商品配送

SVG stroke icon、Paper color、stroke-width 1.5、24×24
hover で Crimson glow（drop-shadow filter）
```

### Accept

```
✓ Businesses 全 page で dark BG + Paper 文字
✓ Header も dark inversion 適用、scroll swap なし
✓ 各事業 section に Layer tag 表示
✓ 5 領域 icon grid 5 個、hover で Crimson glow
✓ contrast Paper on Navy = 14.2:1（WCAG AAA 達成）
✓ sir 視覚承認
```

---

## Phase 5 — Careers (/[locale]/careers)  ⚫ dark inversion

### Goal
hero「LATAM の Agentic Commerce を、誰と建てるか。」+ 4 section を dark surface で実装。

### Steps

```
1. src/app/[locale]/careers/page.tsx           dark layout
2. src/components/sections/CareersHero.tsx     declarative hero
3. src/components/sections/WhatWeBuild.tsx     短い再掲 + /about link
4. src/components/sections/WhoWeAre.tsx        founder culture
5. src/components/sections/OpenPositions.tsx   募集中 card + 課題
6. src/components/sections/CareersContact.tsx  応募窓口
```

### Accept

```
✓ Careers 全 page で dark surface
✓ hero copy が careers.hero.* と一致
✓ Open position card に課題（1 週間 / 5 agent / Claude grade 70+）明記
✓ careers@andes.global mailto link
✓ sir 視覚承認
```

---

## Phase 6 — Press (/[locale]/press)  ⚪ light

### Goal
登壇予定 + メディア掲載 + プレスキットの 3 section を press.stripe.com 風に実装。

### Steps

```
1. src/app/[locale]/press/page.tsx
2. src/components/sections/UpcomingEvents.tsx  IVS 京都 card
3. src/components/sections/MediaCoverage.tsx   Logo grid（現在準備中）
4. src/components/sections/PressKit.tsx        DL button 3 個 + email
5. public/press-kit/                           Logo / 写真 / PDF asset 配置
```

### Accept

```
✓ light surface
✓ IVS 京都 2026-07-01〜07-03 表示
✓ DL link は public/ asset を指す（asset がない場合は placeholder）
✓ press@andes.global mailto link
```

---

## Phase 7 — Contact (/[locale]/contact)  ⚪ light + Resend form

### Goal
4 窓口 Card → form → Resend API 送信を実装。

### Steps

```
1. src/app/[locale]/contact/page.tsx
2. src/components/sections/ContactWindows.tsx  4 card
3. src/components/forms/ContactForm.tsx        単一 form、type 分岐
4. src/app/api/contact/route.ts                Resend 送信 endpoint
5. src/lib/email.ts                            Resend SDK ラッパ + template
6. src/lib/validation.ts                       zod schema
```

### Form spec

```ts
// validation schema (zod)
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(10).max(2000),
  type: z.enum(['investors', 'careers', 'press', 'partners']),
  consent: z.literal(true),
  // honeypot
  honeypot: z.string().max(0),
});
```

### Env vars（.env.local）

```
RESEND_API_KEY=re_xxx
CONTACT_TO_INVESTORS=ir@andes.global
CONTACT_TO_CAREERS=careers@andes.global
CONTACT_TO_PRESS=press@andes.global
CONTACT_TO_PARTNERS=partners@andes.global
CONTACT_FROM=hello@andes.global
```

### Rate limit

```
Vercel Edge KV or Upstash で 1 IP 5 件 / hour
spam 対策: honeypot field（hidden、bot fills）+ 将来的に hCaptcha
```

### Accept

```
✓ 4 窓口 card で type 切替
✓ form validation で error 表示
✓ 送信成功で success message
✓ Resend API → 該当 alias へ送信
✓ honeypot 入力時は silent fail（200 返すが送らない）
✓ test mode（dev）でも送信を spy で検知可能
```

---

## Phase 8 — Polish + OG / SEO / a11y / motion

### Goal
細部仕上げ。OG image 生成、metadata、a11y 監査、motion 微調整。

### Steps

```
1. src/app/[locale]/layout.tsx の generateMetadata 各 page 完成
2. og:image を Vercel OG (next/og) で動的生成
   → 紺背景 #0F1B3D + Paper 文字 + Crimson dot
3. sitemap.xml + robots.txt
4. hreflang tag 全 page 完備
5. a11y 監査: pnpm exec @axe-core/cli http://localhost:3000/ja
6. Lighthouse 各 page Perf > 90, Acc > 95, BP > 95, SEO > 95
7. prefers-reduced-motion 全 motion で対応
8. focus-visible style 全 interactive 要素
9. skip-link 実装
10. Hallmark audit 走らせて指摘点 fix:
    Codex 内で `hallmark audit src/app/[locale]/page.tsx` 実行
```

### Accept

```
✓ 全 page Lighthouse 95+ × 4 metric
✓ axe-core 0 violation
✓ Hallmark audit score < 3 の violation 0 個
✓ OG image 各 page 固有、locale 別
```

---

## Phase 9 — i18n 全 page（en + pt-BR 完備）

### Goal
messages/en.json と messages/pt-BR.json を全 key 完備、native レビュー品質。

### Steps

```
1. messages/ja.json から全 key 抽出
2. en.json: 英語ネイティブ品質、Andes brand tone（断定 / 第一原理 / 数値）維持
3. pt-BR.json: ブラジルポルトガル語、同 tone 維持
4. 翻訳は Claude が下訳、sir が最終 review
5. CI check: missing key で fail（next-intl の type-check）
```

### Accept

```
✓ 3 locale すべての key 完備
✓ sir レビュー pass（特に Hero copy、CTA、form label）
✓ pnpm typecheck で missing key 検出されない
```

---

## Phase 10 — Pre-launch check

### Goal
Vercel preview deploy + sir 最終承認 + production deploy。

### Steps

```
1. Vercel project 接続
2. preview deploy（branch push）
3. sir が preview を全 page × 全 locale で視覚承認
4. domain 接続（sir 確定済 domain、TODO[sir-decide]）
5. Vercel env vars 設定（RESEND_API_KEY 等）
6. production deploy
7. post-deploy smoke test: 全 page 200、全 form 動作
```

### Accept

```
✓ preview URL を sir が全 device（mobile / tablet / desktop）で確認
✓ sir 最終承認
✓ production deploy 成功
✓ smoke test pass
```

---

## Codex 運用 rule

### /goal 利用

```
- 本 doc を Codex の /goal に渡す（Phase 0 → 10 を milestone として）
- Codex は phase ごとに作業、phase 完了で sir に check-in
- sir は side chat で軌道修正、本 thread は止めない
```

### Appshots 利用

```
- sir は preview を appshot（Cmd ×2）で Codex に渡す
- 「ここの hero、Mistral 風にもう一段圧縮して」みたいな指示が成立
- design/wireframes.md v2 と並べて比較 review
```

### Browser annotation 利用

```
- Codex 内 browser で dev preview を開き、要素に直接 feedback
- sir は preview 上で「この card の余白増やして」と書ける
```

### Side chat 利用

```
- 本 thread が phase 進行中でも、side chat で個別 fix 依頼可能
- 本 thread は止めずに parallel 作業
```

---

## Hallmark 利用

```
本 project は `.agents/skills/hallmark/` に Hallmark がインストール済み。
Codex は以下の verb で活用:

  hallmark audit src/app/[locale]/page.tsx
    → 既存 page を anti-AI-slop 指標で採点、punch list 返却

  hallmark study https://stripe.com/
    → Stripe の DNA を抽出して portable design.md を出力
    → 既に design/stripe-shopify-patterns.md があるので参考補強用

  hallmark redesign <target> --mood minimal
    → 既存 component の視覚層だけ rebuild、IA は維持

  通常の build flow → default 動作（Hallmark の self-critique pass を通す）
```

---

## Don't（明示禁止）

```
- pages/ router 追加（App Router only、AGENTS.md 既出）
- 文言 / 法人情報 / 数値のハードコード（messages/*.json と docs/01 から引く）
- default export（Next.js 強制 file 除く、AGENTS.md 既出）
- any / console.log 残し / unused import
- 「北極星」を外部出力 copy に出す
- Round 2/3（商社系）の moodboard を参考にする
- 旧 Cobre #B85C28 / 旧 Sky #4A6FA5 を使う（v1 廃止色）
- 装飾的グラデーション
- 自動 carousel / 過剰 parallax / カーソル追従
- AI 生成 stock photo
- 偽の browser chrome（traffic-light dots 等、Hallmark gate 57）
- 捏造数値（"+47% conversion" 等、Hallmark gate 56）
```

---

## sir 判断待ち（実装前 must）

```
全 8 件 [verified 2026-05-22 sir-decided]、Codex 着手可能:

[x] domain = **andes.global**
[x] 紺 hex = **#0F1B3D**
[x] 赤 hex = **#C8102E**
[x] Font = **Geist + Inter + Noto Sans JP**
[x] Logo SVG = slide からトレース、実装時に placeholder OK
                （sir 後追いで正式版 SVG を `public/logo.svg` に差し替え）
[x] 写真 source = 実装時 placeholder OK
                  （sir 後追いでブラジル現地撮影 / 既存 asset 差し替え）
[x] 数値方針 = **「5 億人」のみ採用**、他は廃止。stats row component 廃止
[x] Email alias = **ir@ / careers@ / press@ / partners@ / hello@ @andes.global**
                  受信フロー（誰が見る・SLA）は運用開始時に確定
```

---

## 改訂履歴

| date | rev | 要点 |
|---|---|---|
| 2026-05-22 | v1 | 初版、Codex /goal mode 入力前提で 11 Phase + Hallmark + 運用 rule 完備 |
| 2026-05-22 | v1.1 | sir-decided 8/8 全 lock、messages/{ja,en,pt-BR}.json 完備（168 key 一致）、handoff-ready（本版） |
