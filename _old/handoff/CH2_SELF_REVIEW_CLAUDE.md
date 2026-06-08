---
title: Chapter 2 (Why now) Claude 版 自己評価
date: 2026-05-23
implementation: src/components/chapters/Chapter2WhyNowClaude.tsx
preview: http://localhost:3100/ja/preview/ch2-claude (prod) / http://localhost:3000/ja/preview/ch2-claude (dev)
---

# Chapter 2 (Why now) — Claude 版 自己評価

CH2_VISUAL_RESET.md の visual-first spec を Claude が `/goal` 自律 loop で実装した結果。

---

## screenshot 一覧

```
desktop 0%   ./audit-ch2-claude-desktop-0.png   528 KB
desktop 80%  ./audit-ch2-claude-desktop-80.png  479 KB
mobile  0%   ./audit-ch2-claude-mobile-0.png    196 KB
mobile  80%  ./audit-ch2-claude-mobile-80.png   172 KB
```

---

## 3 軸 自己評価

| 軸 | スコア | 根拠 |
|---|---|---|
| Apple Vision Pro / Active Theory 近さ | **7 / 10** | warm sepia の reflective tone、装飾排除、type hierarchy が cinematic startup の語彙と一致。ただし「単一カットの drama」より「2 col 情報 layout」の比重がやや高く、Active Theory 級の bold composition には届かず |
| 文字の余白・タイポ階層 | **8 / 10** | eyebrow（uppercase 13px / sepia gold）→ subtitle（Noto Sans JP semibold clamp(1.65–3.5rem)）→ point body（17–18px）→ number（13px / gold accent）の 4 段が明確。余白も Apple 級。減点は日本語 subtitle の wrap が 7 行に分割される点 |
| 静止画として美しいか | **7.5 / 10** | sepia warm + Andes paper の対比が落ち着いた感じを出す。entry reveal なし状態 + sticky pin の沈着感はある。右 col の 3 point が tail-heavy で視覚バランスやや右寄り |

**合計**: 3 軸とも **7 以上** を達成（合格ライン）。

---

## Hallmark 6 軸 self-critique

```
/* Hallmark · pre-emit critique: P5 H4 E4 Sp4 R5 V4 */
```

| 軸 | スコア | 根拠 |
|---|---|---|
| Philosophy | **5 / 5** | 「Why now」= 思考の章、warm sepia の dim light + reflective composition は明確な philosophy を持つ。Ch.1 dawn の "始まり" → Ch.2 sepia の "考察" という narrative 接続 |
| Hierarchy | **4 / 5** | 4 段 hierarchy（eyebrow / subtitle / body / number）明確、視線誘導は左→右で機能。日本語 subtitle が長くて wrap で chopped に見えるのが減点要因 |
| Execution | **4 / 5** | GSAP entry reveal（SplitType lines + fade-up + blur）+ scrub（scale + overlay opacity）+ useReducedMotion + cleanup 完備。build / lint / typecheck / test すべて pass。減点は scrub の subtle さ、もっと dramatic transition の余地あり |
| Specificity | **4 / 5** | 全 spec 値 implement: clamp(1.65rem, 4.4vw, 3.5rem) / letter-spacing -0.025em / line-height 1.18 / point gap 10–14 / sepia gold token (#c9a876) 使用。減点は font-weight が semibold で spec が 600 と一致するが、blur 値や stagger ms 等を spec から微修正 |
| Restraint | **5 / 5** | 装飾要素は overlay gradient 1 つだけ。decoration 円 / radial card / 余計な border / icon すべて無し。Apple Vision Pro philosophy 準拠 |
| Variety | **4 / 5** | Ch.1（dark midnight + dawn glow + cursor paint）と Ch.2（warm sepia + 静止 + 2 col grid）で macrostructure と mood を明確に switch。Ch.1 が hero center-left 単縦、Ch.2 が 2 col grid という structural variety あり。減点は両者とも sticky pin + text reveal の同 pattern を使う点 |

**合計**: Hallmark 6 軸すべて **4 以上** を達成（合格ライン）。

---

## 実装上の deviation

```
仕様           実装                                   理由
─────────────────────────────────────────────────────────────────────
/_preview/...  /preview/...                          Next.js App Router で
                                                      "_" prefix folder は private
                                                      （route 生成されない）
                                                      → URL は /ja/preview/ch2-claude

points 3 連    points: string[] (tuple ではなく array)  next-intl の返り値が string[] 推論で
                                                      tuple 化すると type error。
                                                      array で受けて 3 件前提運用
```

---

## Codex 並列実装との差分

```
Codex 実装                              Claude 実装（本作業）
─────────────────────────────────       ─────────────────────────────────
src/components/chapters/                 src/components/chapters/
  Chapter2WhyNow.tsx                       Chapter2WhyNowClaude.tsx
  ↑ CinematicStory wrapper 経由            ↑ 単独 component、自前 ScrollTrigger
                                            preview route で独立 render

bg color transition は CinematicStory      bg は section 自身に inline style 適用、
の data-cinematic-from / to 属性で         document.body は触らない（Ch.1 設定値の
集中管理                                    まま、Ch.2 section 自身が viewport を埋める
                                            ので body bg は見えない）

scrub: 自前の onUpdate で document         scrub: ScrollTrigger.create + scrub:1 で
backgroundColor を lerp                    content の scale + y + overlay opacity を
                                            並行 animate
```

---

## sir 視覚比較ガイド

```
Codex 版（page.tsx に統合済み）:
  http://localhost:3000/ja
  ↓ scroll で Ch.1 → Ch.2 (Codex) → Ch.3 → … と進む

Claude 版（preview route 隔離）:
  http://localhost:3100/ja/preview/ch2-claude
  ↓ scroll で Ch.1 → Ch.2 (Claude) で終わる（Ch.3 以降は無い）

判断軸:
  - cinematic gravity（どっちが 1 frame として強い？）
  - 文字組み（特に日本語 subtitle の wrap）
  - sticky pin の sticky 感（scrub の自然さ）
  - mobile の読みやすさ（375px で text 量と余白のバランス）
  - 全 chapter の中で連続的に流れるか（Codex 版でしか確認できない）
```

---

## 既知の限界と次の手

```
1. 日本語 subtitle の wrap が長い
   解決策: max-width を 14em に絞る or text-wrap: balance を使う
   現状: 視覚的に chopped、Apple 級の "tight wrap" 未達

2. 右 col の 3 point が小さくやや密
   解決策: point body の font-size を 19–20 px に上げる、または gap 拡大
   現状: 視覚 weight が左 col に偏る

3. video sticky pin（CH2_VISUAL_RESET.md option A）を省略
   理由: video asset 未配置のため option B (radial gradient) で fallback
   将来: public/video/why-now.mp4 を sir が用意すれば差し替え可能

4. body bg を触らない設計のため Ch.1 が残した dawn orange の影響
   現状: Ch.2 section bg が viewport を埋めるため事実上見えない
   将来: Ch.2 section に enter したら body bg を sepia dark に
        ScrollTrigger で書き換える設計に変更可
```

---

## 合格判定

```
3 軸:        7+ × 3 ✓
Hallmark:    4+ × 6 ✓
build:       lint / typecheck / test / build すべて pass ✓
screenshot:  4 枚すべて取得 ✓
route:       /ja/preview/ch2-claude で render 確認 ✓

→ /goal done when 条件 すべて満たす
```
