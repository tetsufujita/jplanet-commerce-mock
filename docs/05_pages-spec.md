---
title: ページ仕様 SSOT
date: 2026-05-22
updated: 2026-05-22
status: validated
tags: [pages, spec, i18n, ssot]
revision: v2（Stripe pattern 適用 + AC 前面化 + 商社 reference 除外）
---

# 05 ページ仕様 SSOT

> 各ページの **セクション構成 / copy 日本語 base / i18n key** の本拠。
> Codex はここを読んで `src/app/[locale]/...` を実装する。
> Visual / motion / palette 規範は `docs/04_brand.md` v2.1 に従う。
> Pattern source は `design/stripe-shopify-patterns.md`。

---

## 全体 navigation

```
Header（全 page 共通）
├── Logo "Andes"            → /[locale]
├── Businesses              → /[locale]/businesses
├── About                   → /[locale]/about
├── Careers                 → /[locale]/careers
├── Press                   → /[locale]/press
├── Contact                 → /[locale]/contact
└── LangSwitcher            → ja / en / pt-BR
```

```
Footer（全 page 共通）
├── Group 紹介 mini
│   - "Andes Inc. (JP) / Andes BR / J-Planet"
├── Businesses
│   - J-Planet / J-Vita
├── Company
│   - About / Careers / Press / Contact
├── Legal
│   - Privacy / Terms / Cookies
└── © Andes Inc. 2026 | Tokyo / São Paulo
```

---

## i18n key 命名規則

```
{page}.{section}.{element}

例:
  home.hero.title
  home.hero.subtitle
  home.hero.cta
  home.portfolio.section_title
  home.portfolio.jplanet.title
  about.northstar.body
  careers.position.engineer.title
```

> 新規 key は **3 locale 全部** 追加（ja / en / pt-BR）。1 つでも欠落すれば CI fail。

---

## /[locale]/ (Top)

### IA

```
┌────────────────────────────────────────────────────────────────┐
│  HERO（80vh、white BG、Stripe pattern）                          │
│  ─ Title: 「Agentic Commerce のための LATAM infrastructure。」    │
│  ─ Subtitle: 「5 億人、$6T 経済圏。AI エージェントを中心に再設計」  │
│  ─ CTA 2: primary 紺 filled / secondary outline                 │
│  ─ 右側: 2 層構造図（line animate once）+ Japan→BR map 1 線      │
├────────────────────────────────────────────────────────────────┤
│  WHY NOW                                                        │
│  ─ Lead: 2026 = AC global 立ち上がり、LATAM 独自進化必要         │
│  ─ Point 3 つ: 物理/法/税が要る / Andes は一体運営 / moat → 規範  │
├────────────────────────────────────────────────────────────────┤
│  PORTFOLIO — "Andes の Agentic Commerce 実装"                   │
│  ─ Lead: "3 つの事業、2 つの layer、1 つの protocol へ。"          │
│  ─ J-Planet（Layer ① 購入エージェント）                          │
│  ─ J-Vita  （Layer ① 購入エージェント・医療）                    │
│  ─ Protocol（Layer ② endgame、2028 OSS）                        │
├────────────────────────────────────────────────────────────────┤
│  GROUP STRUCTURE                                                │
│  ─ Andes Inc.（JP）→ Andes BR → J-Planet → J-Vita              │
│  ─ ASCII / SVG 図                                                │
├────────────────────────────────────────────────────────────────┤
│  FOOTER CTA                                                     │
│  ─ Title: "対話を始める"                                          │
│  ─ Desc:  "投資家 / 採用 / プレス / パートナー"                   │
│  ─ Button: お問い合わせ → /contact                                │
└────────────────────────────────────────────────────────────────┘
```

### Copy（日本語 base）

```yaml
home.hero.title:        "Agentic Commerce のための LATAM infrastructure。"
home.hero.subtitle:     "5 億人の生活基盤を、AI エージェントを中心に再設計する。"
home.hero.cta_primary:  "事業を見る"
home.hero.cta_secondary: "Andes について"

# 数値 stack（sir-decided 2026-05-22）
#   採用数値は「5 億人」のみ。SKU 1,700 / PRC 唯一 / 24 ヶ月先行 / 3 言語等は
#   外部 copy では使用しない。5 億人は subtitle に統合済み。
#   stats row component 自体は廃止。

home.whynow.title:      "Why now"
home.whynow.lead:       "2026 年、Agentic Commerce が global で立ち上がる。
                         LATAM はその独自進化が必要な唯一の経済圏である。"
home.whynow.point1:     "Agentic Commerce を完成させるには LATAM 現場の物理・法・税が要る。
                         これは外部から調達できない。"
home.whynow.point2:     "Andes は merchant 側 / プラットフォーム側 / fintech 側を一体運営する。"
home.whynow.point3:     "現場での knowledge moat が、protocol 化の前提になる。"

home.portfolio.title:   "Andes の Agentic Commerce 実装"
home.portfolio.lead:    "3 つの事業、2 つの layer、1 つの protocol へ。"

home.portfolio.jplanet.tag:    "Layer ① 購入エージェント"
home.portfolio.jplanet.title:  "J-Planet"
home.portfolio.jplanet.desc:   "日本・韓国の品質を WhatsApp エージェント経由でブラジル消費者へ。"
home.portfolio.jplanet.cta:    "詳細を見る"

home.portfolio.jvita.tag:      "Layer ① 購入エージェント（医療）"
home.portfolio.jvita.title:    "J-Vita"
home.portfolio.jvita.desc:     "日本品質の医療を Mandato 個人輸入代行でブラジルへ。"
home.portfolio.jvita.cta:      "詳細を見る"

home.portfolio.protocol.tag:   "Layer ② endgame"
home.portfolio.protocol.title: "LATAM AC Protocol"
home.portfolio.protocol.desc:  "2028 年、LATAM の Agentic Commerce 共通インフラを OSS として発行する。"
home.portfolio.protocol.cta:   "ビジョンを読む"

home.group.title:       "グループ構造"
home.group.desc:        "日本親会社 Andes Inc. が IP と資金を統括し、
                         ブラジル現地で J-Planet が事業を実運用する。"

home.footer_cta.title:  "対話を始める"
home.footer_cta.desc:   "投資家 / 採用 / プレス / パートナー"
home.footer_cta.button: "お問い合わせ"
```

---

## /[locale]/about

### IA

```
┌────────────────────────────────────────────────────────────────┐
│  VISION（white BG）                                              │
│  ─ Title: 「向かう先」                                            │
│  ─ Lead:  「中南米経済の新しい基盤を作る。」                       │
│  ─ Body:  AC が global で立ち上がる 2026、LATAM の AC は別物として  │
│           進化する必要。Andes はその base layer を建てる。           │
├────────────────────────────────────────────────────────────────┤
│  2 LAYER（Agentic Commerce の 2 層構造）                          │
│  ─ Layer ① 購入エージェント（消費者接点）                          │
│  ─ Layer ② プラットフォーム（物流・税・法・通関・ERP）             │
│  ─ SVG schematic（line animate once on scroll-in）                │
├────────────────────────────────────────────────────────────────┤
│  PHASE ROADMAP                                                  │
│  ─ Phase 1-4 + Protocol endgame の概要                            │
│  ─ 横長 timeline 図、各 phase = AC for LATAM 達成への step          │
├────────────────────────────────────────────────────────────────┤
│  TEAM                                                           │
│  ─ sir / しゅうや / えりき                                         │
│  ─ Mercury / Linear minimal card                                  │
├────────────────────────────────────────────────────────────────┤
│  GROUP STRUCTURE                                                │
│  ─ Top と同じ図、詳細版                                            │
└────────────────────────────────────────────────────────────────┘
```

### Copy（日本語 base）

```yaml
# 注: about.northstar.* → about.vision.* に rename（北極星語の外部 NG ルール対応）
about.vision.title:     "向かう先"
about.vision.lead:      "中南米経済の新しい基盤を作る。"
about.vision.body:      "LATAM の GDP は $6 兆。その 1-2% を自社インフラに通す規模を目指す。
                         Agentic Commerce が global で立ち上がる 2026 年、
                         LATAM の AC は別物として進化する必要がある。
                         Andes はその base layer を建てる。100 年続く企業を、ブラジル発で。"

about.2layer.title:     "Agentic Commerce の 2 層構造"
about.2layer.lead:      "AC を完成させるには、巨人にはできない 2 つの層が要る。"
about.2layer.layer1.tag:    "Layer ①"
about.2layer.layer1.title:  "購入エージェント"
about.2layer.layer1.body:   "グローバル AI を LLM として使い、LATAM 消費者との接点を作る。
                             ここはブランディング層、巨人にリプレイスされても OK。"
about.2layer.layer2.tag:    "Layer ②"
about.2layer.layer2.title:  "プラットフォーム"
about.2layer.layer2.body:   "物流・税務・法務・通関・ERP・会計。LATAM 現場の knowledge は
                             大手には構築できない、ここで本当の価値が出る。"

about.phase.title:      "Phase roadmap"
about.phase.lead:       "AC for LATAM の達成は、5 つの step で進む。"
about.phase.p1.year:    "2026"
about.phase.p1.title:   "越境 EC × WhatsApp エージェント"
about.phase.p2.year:    "2027"
about.phase.p2.title:   "BR 国内 EC 横断エージェント（A2A）"
about.phase.p3.year:    "2028"
about.phase.p3.title:   "エージェントネイティブ ERP × Marketplace × Factoring"
about.phase.p4.year:    "2029-30"
about.phase.p4.title:   "Agentic Fintech 全面"
about.phase.endgame.year:  "2028 +"
about.phase.endgame.title: "LATAM AC Protocol（OSS de facto）"

about.team.title:       "Team"
about.team.lead:        "ビジョン主導の Founder と構造化を担う Architect のペアを核に、AI を最大限に使う少数精鋭。"

about.group.title:      "グループ構造"
about.group.desc:       "Andes Inc.（JP）が IP と資金を統括、Andes BR を経て J-Planet が事業を実運用。"
```

---

## /[locale]/businesses

> **dark inversion**（Modal pattern）。紺背景 + Paper 文字 + Crimson glow on hover。
> AC の "AI startup" 性を打ち出す surface。

### IA

```
┌────────────────────────────────────────────────────────────────┐
│  HERO（dark BG #0F1B3D、Paper #FAFAF7 文字）                     │
│  ─ Title: 「Andes の Agentic Commerce 実装」                      │
│  ─ Lead:  「3 つの事業、2 つの layer、1 つの protocol へ。」       │
├────────────────────────────────────────────────────────────────┤
│  J-PLANET（Layer ① 購入エージェント）                              │
│  ─ tag: Layer ① 購入エージェント                                   │
│  ─ Phase 1 launch 2026-06-01                                    │
│  ─ 日本商品 catalog 全件 / WhatsApp 体験 demo / 商品カテゴリ      │
│  ─ CTA: jplanet.com.br へ                                        │
├────────────────────────────────────────────────────────────────┤
│  J-VITA（Layer ① 購入エージェント・医療）                          │
│  ─ tag: Layer ① 購入エージェント（医療）                           │
│  ─ Phase 0a launch 2026-06-01                                    │
│  ─ GLP-1 / 育毛 / ホルモン                                        │
│  ─ Mandato 個人輸入代行                                            │
│  ─ CTA: j-vita.com.br へ（将来）                                   │
├────────────────────────────────────────────────────────────────┤
│  LATAM AC PROTOCOL（Layer ② endgame）                            │
│  ─ tag: Layer ② endgame                                          │
│  ─ 2028 target、OSS 発行 vision                                   │
│  ─ PIX / NF-e / ICMS / LGPD / CDC を MCP 化                       │
│  ─ Anthropic Research 風 framing、spec は出さない                 │
│  ─ CTA: ビジョンを読む → /about                                    │
├────────────────────────────────────────────────────────────────┤
│  5 領域 ICON GRID（Stripe Solutions 構造）                        │
│  ─ 商品提案 / 規制対応 / 越境決済 / 簡易通関 / 商品配送           │
│  ─ SVG icon stroke、Paper color、5 col grid                       │
└────────────────────────────────────────────────────────────────┘
```

### Copy（日本語 base）

```yaml
businesses.hero.title:     "Andes の Agentic Commerce 実装"
businesses.hero.lead:      "3 つの事業、2 つの layer、1 つの protocol へ。"

businesses.jplanet.tag:    "Layer ① 購入エージェント"
businesses.jplanet.title:  "J-Planet"
businesses.jplanet.lead:   "日本・韓国の品質を WhatsApp 経由でブラジル消費者へ。"
businesses.jplanet.body:   "Phase 1 launch 2026-06-01。日本商品 catalog 全件を投入、
                            WhatsApp エージェント体験で購買から決済・配送までを一体で運営する。"
businesses.jplanet.cta:    "jplanet.com.br へ"

businesses.jvita.tag:      "Layer ① 購入エージェント（医療）"
businesses.jvita.title:    "J-Vita"
businesses.jvita.lead:     "日本品質の医療を Mandato 個人輸入代行でブラジルへ。"
businesses.jvita.body:     "Phase 0a launch 2026-06-01。GLP-1 / 育毛 / ホルモン / ダイエット。
                            J-Medical Ltda（設立予定）が consumer brand を運営。"
businesses.jvita.cta:      "j-vita.com.br へ（将来）"

businesses.protocol.tag:   "Layer ② endgame"
businesses.protocol.title: "LATAM AC Protocol"
businesses.protocol.lead:  "2028 年、LATAM の Agentic Commerce 共通インフラを OSS として発行する。"
businesses.protocol.body:  "PIX / NF-e / ICMS / LGPD / CDC を MCP 化し、巨人（OpenAI / Google /
                            Anthropic）が Andes を呼ぶ position を取る。LATAM の AWS + Stripe + 楽天。"
businesses.protocol.cta:   "ビジョンを読む"

businesses.areas.title:    "対応領域"
businesses.areas.lead:     "Andes が運営する 5 つの layer。"
businesses.areas.a1:       "商品提案（日本商品全展開）"
businesses.areas.a2:       "規制対応（BR 機関適合）"
businesses.areas.a3:       "越境決済（BR 現地決済）"
businesses.areas.a4:       "簡易通関（関税 0%）"
businesses.areas.a5:       "商品配送（消費者へ宅配）"
```

---

## /[locale]/careers

> **dark inversion**。Engineer 採用 = AI startup tone。
> Linear sharpness + Mistral 主権 framing。

### IA

```
┌────────────────────────────────────────────────────────────────┐
│  HERO（dark BG）                                                 │
│  ─ Title: 「LATAM の Agentic Commerce を、誰と建てるか。」          │
│  ─ Lead:  「Claude Code Native engineer を 2-3 名募集。」           │
├────────────────────────────────────────────────────────────────┤
│  何を作っているか                                                 │
│  ─ 2 層構造 + Phase roadmap の短い再掲（link to /about）           │
├────────────────────────────────────────────────────────────────┤
│  誰と作るか                                                       │
│  ─ Visionary × Architect の少数精鋭                                │
│  ─ AI を最大限に使う、人 ML タスク 0                                │
├────────────────────────────────────────────────────────────────┤
│  募集中ポジション                                                  │
│  ─ Claude Code Native Engineer (Senior) × 2-3 名                  │
│  ─ 課題: 1 週間で 5 agent を build、Claude grade 70+ pass          │
│  ─ Mistral 風 declaration + Cursor 風 engineer 訴求                │
├────────────────────────────────────────────────────────────────┤
│  応募窓口                                                          │
│  ─ careers@andes.global / form                                    │
└────────────────────────────────────────────────────────────────┘
```

### Copy（日本語 base）

```yaml
careers.hero.title:     "LATAM の Agentic Commerce を、誰と建てるか。"
careers.hero.lead:      "Claude Code Native engineer を 2-3 名募集する。"

careers.what.title:     "何を作っているか"
careers.what.lead:      "中南米の Agentic Commerce 基盤。3 つの事業、2 つの layer、1 つの protocol。"
careers.what.cta:       "詳しく → /about"

careers.who.title:      "誰と作るか"
careers.who.body:       "Andes はビジョン主導の Founder と構造化を担う Architect のペアを核にした
                         少数精鋭。AI を最大限に使い、人を機械学習タスクに使わない。
                         Claude Code Native 文化で、build スピードで他社の 5-10 倍を出す。"

careers.open.title:     "募集中ポジション"
careers.open.engineer.title:  "Claude Code Native Engineer（Senior）"
careers.open.engineer.lead:   "× 2-3 名"
careers.open.engineer.body:   "Claude Code / Codex / 自律エージェントを日常使用、
                               第一原理思考で build。LATAM の AC 基盤を共に建てる engineer。"
careers.open.engineer.challenge.title:  "選考課題"
careers.open.engineer.challenge.body:   "1 週間で 5 agent を build、Claude grade 70+ pass。"
careers.open.engineer.cta:    "詳細・応募"

careers.contact.title:  "応募・問い合わせ"
careers.contact.email:  "careers@andes.global"
careers.contact.cta:    "応募する"
```

---

## /[locale]/press

> press.stripe.com の抑制 list 構造。light BG、curated authority tone。

### IA

```
┌────────────────────────────────────────────────────────────────┐
│  HERO                                                            │
│  ─ Title: 「Press」                                                │
│  ─ Lead:  「メディア取材・登壇依頼・プレスキット。」                │
├────────────────────────────────────────────────────────────────┤
│  登壇予定                                                          │
│  ─ IVS 京都 2026-07-01 〜 07-03                                    │
│  ─ Speaker: 藤田テツ（CEO）                                        │
│  ─ Theme: Japan is Back × LATAM AC                                │
├────────────────────────────────────────────────────────────────┤
│  メディア掲載                                                      │
│  ─ Logo grid（grayscale、hover で色付き）                          │
│  ─ 掲載 list（title + outlet + date + link）                       │
├────────────────────────────────────────────────────────────────┤
│  プレスキット                                                      │
│  ─ Logo DL（color / mono / dark）                                  │
│  ─ 写真 DL（CEO portrait / chamber / 商品）                        │
│  ─ 会社概要 PDF                                                     │
│  ─ press@andes.global                                              │
└────────────────────────────────────────────────────────────────┘
```

### Copy（日本語 base）

```yaml
press.hero.title:       "Press"
press.hero.lead:        "メディア取材・登壇依頼・プレスキット。"

press.upcoming.title:   "登壇予定"
press.upcoming.ivs.title:     "IVS 京都 2026"
press.upcoming.ivs.date:      "2026-07-01 〜 07-03"
press.upcoming.ivs.venue:     "みやこめっせ + ホテルオークラ京都"
press.upcoming.ivs.theme:     "Japan is Back × LATAM Agentic Commerce"
press.upcoming.ivs.speaker:   "藤田テツ（Andes Inc. CEO）"

press.coverage.title:   "メディア掲載"
press.coverage.empty:   "現在準備中。"

press.kit.title:        "プレスキット"
press.kit.logo:         "ロゴ DL（color / mono / dark）"
press.kit.photo:        "写真 DL"
press.kit.profile:      "会社概要 PDF"
press.kit.contact:      "press@andes.global"
press.kit.cta:          "プレスキットをダウンロード"
```

---

## /[locale]/contact

> light BG、Mercury / Linear minimal form。誤操作回避のため必ず light。

### IA

```
┌────────────────────────────────────────────────────────────────┐
│  HERO                                                            │
│  ─ Title: 「対話を始める」                                          │
│  ─ Lead:  「4 つの窓口から、目的に合うものを選んでください。」      │
├────────────────────────────────────────────────────────────────┤
│  4 窓口 Card                                                      │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ 投資家         │ 採用          │ プレス        │ パートナー    │ │
│  │ Series A / IR │ 候補者応募    │ 取材 / 登壇   │ 事業提携      │ │
│  │ → 選択         │ → 選択         │ → 選択         │ → 選択         │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  Form（単一 component、type 分岐）                                 │
│  ─ 名前 / メール / 会社 / 件名 / 本文 / type (hidden)              │
│  ─ プライバシーポリシー同意 checkbox                                │
│  ─ 送信 button                                                    │
└────────────────────────────────────────────────────────────────┘
```

### Copy（日本語 base）

```yaml
contact.hero.title:     "対話を始める"
contact.hero.lead:      "4 つの窓口から、目的に合うものを選んでください。"

contact.windows.investors.title:    "投資家"
contact.windows.investors.desc:     "Series A 関連 / IR / 投資検討"
contact.windows.careers.title:      "採用"
contact.windows.careers.desc:       "候補者応募 / 人事問合せ"
contact.windows.press.title:        "プレス"
contact.windows.press.desc:         "取材依頼 / 登壇依頼"
contact.windows.partners.title:     "パートナー"
contact.windows.partners.desc:      "事業提携 / ベンダー"

contact.form.name.label:    "お名前"
contact.form.email.label:   "メールアドレス"
contact.form.company.label: "会社名 / 所属"
contact.form.subject.label: "件名"
contact.form.body.label:    "本文"
contact.form.consent.label: "プライバシーポリシーに同意します"
contact.form.submit:        "送信"

contact.form.success:       "送信ありがとうございます。営業日 2 日以内にご返信します。"
contact.form.error:         "送信に失敗しました。お手数ですが再度お試しください。"
```

### 実装メモ（Codex 向け）

- `/api/contact/route.ts` で server action 受け、Resend SDK で送信
- 環境変数: `RESEND_API_KEY` / `CONTACT_TO_INVESTORS` / `CONTACT_TO_CAREERS` / `CONTACT_TO_PRESS` / `CONTACT_TO_PARTNERS`
- rate limiting: Vercel Edge KV or Upstash で 1 IP 5 件/h
- spam 対策: honeypot field + hCaptcha (v2 候補)

---

## 共通要素

### Header（Shopify pattern: sticky 透明 → scroll で白 swap）

```tsx
// 構造（pseudo）
<header className="sticky top-0 z-50">
  {/* Top page では hero 上で透明、scroll でも白 swap。dark inversion page では常時 dark BG */}
  <Logo />
  <Nav>
    {navItems.map(...)}
  </Nav>
  <CTA>お問い合わせ</CTA>  {/* 右側 1 個、primary 紺 filled */}
  <LangSwitcher current={locale} />
</header>
```

- 高さ 72px desktop / 56px mobile
- **Top page**: hero 上で透明 + Paper 文字、scroll 開始で白背景 + Ink 文字 swap（300ms ease）
- **dark inversion page (Businesses / Careers)**: 常時 dark BG + Paper 文字
- mobile: hamburger menu、開くと full-screen overlay
- LangSwitcher は dropdown（ja / en / pt-BR）、現在 locale を表示
- 右側に primary CTA「お問い合わせ」1 個（Shopify pattern）

### Footer

```tsx
<footer>
  <GroupMini />
  <FooterNav columns={4} />
  <Legal />
  <Copyright />
</footer>
```

### LangSwitcher

- 現在 locale を表示
- click で他 locale 表示
- 切替時は **同じ path で locale だけ変える**（`/ja/about` → `/en/about`）
- 翻訳がない page は default locale にフォールバック

---

## SEO / OG（全 page 共通フォーマット）

```yaml
# title format
{Page Title} | Andes — Agentic Commerce for LATAM

# description（各 page 固有、155 字以内）
home.meta.description:        "5 億人、$6T 経済圏。Agentic Commerce のための LATAM infrastructure を建てる Andes Inc. の公式サイト。"
about.meta.description:       "中南米経済の新しい基盤を作る。Agentic Commerce の 2 層構造、Phase roadmap、team。"
businesses.meta.description:  "Andes の Agentic Commerce 実装。J-Planet（越境 EC）/ J-Vita（医療）/ LATAM AC Protocol。"
careers.meta.description:     "LATAM の Agentic Commerce を、誰と建てるか。Claude Code Native engineer 募集。"
press.meta.description:       "Andes Inc. のメディア取材・登壇予定・プレスキット。"
contact.meta.description:     "投資家 / 採用 / プレス / パートナー、4 つの窓口から対話を始める。"

# og:image (1200×630、各 page 固有、locale ごと)
# - 紺背景 + Paper 文字 + Crimson dot（Stripe / Modal pattern）
# - title は中央に置き、Andes Inc. logo を左上、locale 表示を右下
```

---

## v2 候補（今 scope 外）

- /[locale]/blog（プレス記事 / 技術ブログ）
- /[locale]/investors（IR 専用 page、Series A 後）
- /[locale]/protocol（LATAM AC Protocol 詳細、2028 近く）
- ES（スペイン語）追加

---

## 改訂履歴

| date | rev | 要点 |
|---|---|---|
| 2026-05-22 | v1 | 初版、6 page IA + 一部 copy yaml |
| 2026-05-22 | v2 | Stripe pattern 適用、AC 前面化、商社 reference 除外、`about.northstar.*` → `about.vision.*` rename、stats row 追加、Businesses / Press / Contact に copy yaml 追加、Header sticky 透明→白 swap、SEO meta フォーマット追加（本版） |
