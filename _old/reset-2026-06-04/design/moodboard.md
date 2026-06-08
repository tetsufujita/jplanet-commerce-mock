---
title: Moodboard
date: 2026-05-22
updated: 2026-05-22
status: hypothesis
tags: [design, moodboard, reference]
---

# Moodboard

> サイトの **視覚的な参考点**。Andes が目指すべき位置を、既存サイトとの対比で示す。

---

## 目指す位置

```
                  野心 visible
                       ↑
                       │
                       │            ● Andes（目標）
                       │
   日本的精緻 ─────────┼─────────  LATAM vibrant
                       │
                       │
                       ↓
                  控えめ・neutral
```

---

## 参考サイト（タイプ別）

### A. Tech / インフラ系（野心 visible × neutral）

| サイト | URL | 学ぶ点 | 避ける点 |
|---|---|---|---|
| Anthropic | anthropic.com | 余白の取り方、type の使い方、断定的 copy | 過度な monochrome |
| Stripe | stripe.com | 多言語、tech 信頼感、figure / diagram の使い方 | サイズが巨大すぎる |
| Vercel | vercel.com | typography、dark / light の切り替え | 動的演出やや過剰 |
| Linear | linear.app | 整理された IA、軽快な動き | 単機能 SaaS 寄り |
| Cloudflare | cloudflare.com | global scale の表現 | やや old-school |

### B. LATAM 大手（現地感、信頼感）

| サイト | URL | 学ぶ点 | 避ける点 |
|---|---|---|---|
| Nubank | nubank.com.br | 自信ある copy、purple アクセント | 一般消費者向け過ぎ |
| Mercado Libre | mercadolibre.com | LATAM 顔の作り方 | EC 寄り、ごちゃつき |
| Rappi | rappi.com | speed feel | 派手すぎ |

### C. 日本企業の global 顔（精緻さ）

| サイト | URL | 学ぶ点 | 避ける点 |
|---|---|---|---|
| SoftBank Group | group.softbank | 投資家向け、グループ構造の見せ方 | 古い |
| Sony | sony.com | 日本企業の global standard | 大企業臭 |
| Mercari | about.mercari.com | tech × 日本ブランドの組合せ | scope 違い |

### D. holding company / インベストメント系

| サイト | URL | 学ぶ点 | 避ける点 |
|---|---|---|---|
| Berkshire Hathaway | berkshirehathaway.com | 古典的、信頼、装飾排除 | やり過ぎは野暮 |
| Sequoia Capital | sequoiacap.com | type 主体、investor 顔 | やや fund 専門 |
| Andreessen Horowitz (a16z) | a16z.com | thought-leadership、ブログ起点 | media 化しすぎ |

---

## 色 reference

```
Andes 候補 palette と参考の対比

[Andes 候補]
  bg:    #FAFAF7  (off-white、紙の温度)
  fg:    #0A0A0A  (深い black)
  accent: #B85C28 (cobre / 銅)
  sky:    #4A6FA5 (高地の空)

[Anthropic]
  bg: #FAFAF7（近い）
  accent: #C9663E（cobre 系、近い）

[Linear]
  bg: #FFFFFF / #08090A（white / black）
  accent: 紫グラデ

[Nubank]
  bg: #FFFFFF
  accent: #820AD1（purple）
```

> Anthropic と最も近い palette を採用候補。ただし accent の **cobre #B85C28** で南米鉱物の暗示を入れ、差別化する。

---

## タイポ reference

```
推奨組合せ案 A:
  Display / Heading:  Founders Grotesk
  Body:               Inter
  日本語:             Noto Sans JP
  → Anthropic / Linear に近い、modern × neutral

推奨組合せ案 B:
  Display / Heading:  GT America
  Body:               Söhne Buch
  日本語:             Hiragino Sans
  → Stripe / Vercel に近い、tech 信頼感

推奨組合せ案 C（無料優先）:
  Display / Heading:  Geist (Vercel)
  Body:               Inter
  日本語:             Noto Sans JP
  → 全部 OFL / 商用無料、Vercel deploy 親和性高
```

> **暫定推奨: 案 C**（無料、Vercel 親和、品質十分）
> 予算ある場合 案 A へ昇格を検討

---

## 写真 reference

### 撮りたい雰囲気

- ブラジルの自然光（warm、彩度低め）
- サンパウロ都市感（モダン × 雑然のコントラスト）
- 日本の精緻さ（cleanness、minimalism）
- 人物は **作業中** or **遠景**、stock photo 的な「笑顔」NG

### NG な写真

- White office で笑顔の team
- 過剰な corporate handshake
- 一般的な diversity-stock
- AI 生成画像（authenticity 重視）

---

## 動き reference

### OK

- Hero text の fade in（一度きり、300-500ms）
- Card hover 4px 上昇 + subtle shadow
- Lang switcher の slide
- Section 入場で 24px 下から fade in

### NG（**絶対やらない**）

- Auto carousel
- 過剰 parallax
- カーソル追従
- スクロール連動カメラ移動
- BGM / SFX

---

## 既存ロゴ asset（暫定）

- ロゴ data **未確定** [TODO sir-decide]
- 暫定 fallback: Type ベース "Andes" Founders Grotesk Bold（or Geist Bold 案 C 採用時）
- 山脈モチーフ symbol は v2 で追加検討

---

## 確認待ち（sir 判断）

- [ ] palette 確定（Andes Cobre #B85C28 OK?）
- [ ] typography 案（A / B / C どれ）
- [ ] ロゴ source / data
- [ ] 写真 source / 撮影予定
- [ ] 参考にしたい / 真似したい 既存サイト specific (sir 追加)
