# Chapter 2 (Why now) — Visual reset 指示書

> Codex / Claude どちらにも渡せる universal 版。
> Ch.1 visual reset と同じ密度。spec は frame-by-frame、completion gate は screenshot。
> sir が Codex に paste するか、`/goal` で Claude に渡すかの 2 通り。

---

## 貼り付け本文（Codex / Claude 共通）

```
Chapter 2 (Why now) を visual-first で実装する。

================================================================
SCOPE（厳守）
================================================================

- src/components/chapters/Chapter2WhyNow.tsx を新規作成
- src/app/[locale]/page.tsx を update して Ch.1 → Ch.2 を縦連続 render
- 必要なら src/components/cinematic/ に共通 helper を追加
- 既存 file への変更は最小限:
  - Chapter1Overture.tsx       絶対に触らない
  - PaintCanvas.tsx             触らない
  - SmoothScrollProvider.tsx    触らない
  - MotionGate.tsx               touch OK（reduced motion gate を再利用）
  - layout.tsx / Header / Footer  触らない
- Chapter 3-7 のファイルを作らない、触らない
- messages/{ja,en,pt-BR}.json の既存 key を変更しない
  新規 key を追加するなら 3 言語完備 + ja base に追加

================================================================
PHILOSOPHY
================================================================

cinematic = 「1 frame として完成度高い静止画 + その間の motion」
checklist 完遂モード禁止。

Ch.2 は「Why now」= 2026 年に Agentic Commerce が global で立ち上がる、
LATAM は独自進化が必要な唯一の経済圏、という insight を映画的 sticky pin
で見せる章。Apple Vision Pro の "Welcome to the era of spatial computing"
シーンの構図に近い。

================================================================
REFERENCE FRAMES（必ず見る）
================================================================

下記 URL を WebFetch or 内蔵 browser で Hero/intro screen を観察:

1. https://www.apple.com/apple-vision-pro/  （sticky pin scene + 静止 video frame）
2. https://www.apple.com/apple-watch-ultra-2/  （environmental scene + text reveal）

観察:
- video / mp4 が背景一面、loop + mute
- text は中央 or 左下に大きく置く、subtitle 別行
- video frame は緩やかな zoom in / pan、scroll で frame 進行制御
- text は 1-2 sec で fade-up、scroll で進む

================================================================
CONTENT（既存 messages から引く、ハードコード厳禁）
================================================================

i18n key（messages/{ja,en,pt-BR}.json に既存）:
  home.cinematic.whyNow.title       "Why now"
  home.cinematic.whyNow.subtitle    "2026 年、Agentic Commerce が global で立ち上がる。
                                     LATAM は独自進化が必要な唯一の経済圏。"
  home.cinematic.whyNow.points.one  "Agentic Commerce を完成させるには、現地の
                                     物理・法・税・決済が必要になる。"
  home.cinematic.whyNow.points.two  "LATAM はひとつの市場ではなく、制度と生活導線が
                                     絡み合う経済圏である。"
  home.cinematic.whyNow.points.three "Andes は現場で事業を動かし、その knowledge を
                                      protocol へ変換する。"

新規 key は不要、上記 5 つだけで構成可能。

================================================================
EXACT VISUAL SPEC — DESKTOP（1440px viewport）
================================================================

SECTION:
  min-height: 250vh（2.5 viewport sticky pin）
  position: relative
  background-color: rgb(28, 24, 18)  /* sepia-tinted dark、Ch.1 dawn と違う mood */
  overflow: clip

STICKY INNER:
  position: sticky top-0
  min-height: 100vh
  display: flex、items-center

BACKGROUND VIDEO（or static gradient if video asset 無し）:
  position: absolute inset-0
  options A: <video> autoplay muted loop playsInline
    src: public/video/why-now.mp4（asset 用意できなければ option B）
    object-fit: cover
    opacity: 0.55
    filter: brightness(0.7) contrast(1.1)
  options B: full-bleed radial-gradient:
    background:
      radial-gradient(circle at 30% 40%,
        rgba(201, 168, 118, 0.18) 0%,
        transparent 50%),
      radial-gradient(circle at 70% 60%,
        rgba(168, 149, 103, 0.12) 0%,
        transparent 55%),
      rgb(28, 24, 18);
  ⚠️ 静止画段階では option B で OK、後で video asset 差し替え

DARK OVERLAY:
  position: absolute inset-0
  background: linear-gradient(180deg,
    rgba(28, 24, 18, 0) 0%,
    rgba(28, 24, 18, 0.4) 50%,
    rgba(28, 24, 18, 0.85) 100%)
  pointer-events: none

CONTENT CONTAINER:
  position: relative z-10
  max-width: 1280px
  margin: 0 auto
  padding: 0 120px
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 96px
  align-items: center

LEFT COLUMN — TITLE BLOCK:
  Eyebrow（小タグ "Why now"）:
    font-family: Geist
    font-weight: 500
    font-size: 13px
    letter-spacing: 0.18em
    text-transform: uppercase
    color: rgba(250, 250, 247, 0.55)
    margin-bottom: 32px
    display: block
  
  Subtitle（"2026 年、Agentic Commerce が..." subtitle）:
    font-family: Noto Sans JP
    font-weight: 600
    font-size: 56px
    line-height: 1.15
    letter-spacing: -0.025em
    color: rgb(250, 250, 247)
    max-width: 540px

RIGHT COLUMN — POINTS LIST:
  display: flex flex-col
  gap: 56px
  
  Each point:
    number (01 / 02 / 03):
      font-family: Geist
      font-weight: 300
      font-size: 13px
      letter-spacing: 0.18em
      color: rgb(201, 168, 118)  /* warm gold */
      margin-bottom: 12px
    
    body text:
      font-family: Noto Sans JP
      font-weight: 400
      font-size: 18px
      line-height: 1.65
      letter-spacing: -0.005em
      color: rgba(250, 250, 247, 0.85)
      max-width: 380px

================================================================
EXACT VISUAL SPEC — MOBILE（375px viewport）
================================================================

SECTION min-height: 200vh（mobile は若干短く）

CONTENT:
  padding: 0 24px
  display: flex flex-col
  gap: 64px
  vertical-center

TITLE BLOCK:
  eyebrow: 11px / letter-spacing 0.2em
  subtitle: 28px / line-height 1.2 / max-width 100%

POINTS LIST:
  gap: 40px
  number: 11px
  body: 15px / line-height 1.6

================================================================
ANIMATION SPEC
================================================================

ENTRY REVEAL（scroll で section が viewport top に近づいた瞬間に発火）:
  trigger: ScrollTrigger
    start: "top 80%"
    once: true（once reveal、scrub なし）
  
  eyebrow + subtitle:
    from: opacity 0, translateY 32px, blur 6px
    to:   opacity 1, translateY 0, blur 0
    duration: 0.8s, ease cubic-bezier(0.16, 1, 0.3, 1)
    delay: 0.1s
    split: SplitType に lines（句単位、文字単位ではない）
  
  points:
    stagger: 0.15s between each
    from: opacity 0, translateY 24px
    to:   opacity 1, translateY 0
    duration: 0.65s

SCROLL ANIMATION（sticky pin section）:
  scrub:1 で section に紐付け
  
  content:
    scale: 1 → 0.96
    translateY: 0 → -32px
  
  overlay opacity:
    scroll 0% → 0.6
    scroll 100% → 0.95

REDUCED MOTION:
  prefers-reduced-motion: reduce 時:
    全 animation 即時完成、scroll-trigger 無効化

================================================================
PAGE INTEGRATION
================================================================

src/app/[locale]/page.tsx:
  Ch.1 の後に Ch.2 を render:
  
  ```tsx
  import { Chapter1Overture } from "@/components/chapters/Chapter1Overture";
  import { Chapter2WhyNow } from "@/components/chapters/Chapter2WhyNow";
  
  // ... existing translation logic ...
  
  return (
    <main id="main">
      <Chapter1Overture ... />
      <Chapter2WhyNow ... />
    </main>
  );
  ```

Ch.2 が Ch.1 の後に sticky pin する形で出現。
Ch.1 の dawn glow が完了 → Ch.2 の sepia world に切替わる。

================================================================
SUBMISSION（合格条件）
================================================================

実装後、必ず以下を実行:

1. pnpm dev を起動
2. desktop 1440x900 で http://localhost:3000/ja を開く
   scroll を Ch.2 が viewport center に来る位置に進める
   screenshot 1: ./audit-ch2-desktop-0.png（Ch.2 entry 直後）
   screenshot 2: ./audit-ch2-desktop-80.png（Ch.2 sticky 80% 位置）
3. mobile 375x812 で同様に
   screenshot 3: ./audit-ch2-mobile-0.png
   screenshot 4: ./audit-ch2-mobile-80.png
4. 自己評価 ./CH2_SELF_REVIEW.md に書く:
   - Apple Vision Pro / Active Theory 近さ（0-10）
   - 文字の余白・タイポ階層（0-10）
   - 静止画として美しいか（0-10）
   - Hallmark 6 軸（Philosophy / Hierarchy / Execution / Specificity / Restraint / Variety、各 0-5）
   - 3 軸とも 7 以上 + Hallmark 各 4 以上 を合格ラインとする
   - 足りなければ revision してから提出
5. pnpm lint && pnpm typecheck && pnpm test && pnpm build 全 pass

================================================================
DON'T
================================================================

- Ch.1 file（Chapter1Overture.tsx, PaintCanvas.tsx）変更
- Ch.3-7 の file を作る / 触る
- messages/{ja,en,pt-BR}.json の既存 key を変更
- WebGL / R3F Canvas を Ch.2 に追加（WebGL は Ch.1 と Ch.6 のみ）
- ハードコード文言、必ず useTranslations 経由
- 北極星 / 商社 ref / 5 億人以外の数値を copy に出す
- video asset が無いときに無理に video tag を入れる（gradient fallback で OK）
- decoration 過多、circle / radial card 等の "checklist" 装飾
- screenshot 提出を省略
- "build pass" だけで合格判定
```

---

## /goal 起動用（sir が paste して Claude 自律実行させる場合）

```
/goal Andes corporate site の Chapter 2 (Why now) を visual-first で実装、
desktop / mobile screenshot 4 枚 + 自己評価 + Hallmark 6 軸まで完了する状態にする。

context:
- repo: ~/Desktop/Andes-Website
- 指示書: ~/Desktop/Andes-Website/CH2_VISUAL_RESET.md（必ず読んで spec 通り）
- stack: Next.js 15 App Router + Lenis + GSAP + R3F（Ch.1 で導入済み）
- Ch.1 (Chapter1Overture.tsx) は完成済み、変更しない

done when:
- src/components/chapters/Chapter2WhyNow.tsx が新規作成され spec 通り実装されている
- src/app/[locale]/page.tsx で Ch.1 → Ch.2 が縦連続 render されている
- pnpm lint && pnpm typecheck && pnpm test && pnpm build が exit 0
- ./audit-ch2-desktop-0.png, ./audit-ch2-desktop-80.png, ./audit-ch2-mobile-0.png,
  ./audit-ch2-mobile-80.png の 4 枚 screenshot が存在する
- ./CH2_SELF_REVIEW.md に 3 軸自己評価 + Hallmark 6 軸が書かれており、
  3 軸とも 7 以上、Hallmark 6 軸とも 4 以上

do not:
- Chapter1Overture.tsx, PaintCanvas.tsx, SmoothScrollProvider.tsx を変更
- Chapter 3-7 の file を作らない、触らない
- messages/{ja,en,pt-BR}.json の既存 key を変更しない
- ハードコード文言、必ず useTranslations 経由
- WebGL / R3F Canvas を Ch.2 に追加しない

progress tracking:
./CH2_PROGRESS.md に完了 step を随時記録すること
```

---

## sir 操作

```
Codex に投げる場合:
  1. CH2_VISUAL_RESET.md を開く
  2. 「貼り付け本文」を copy
  3. Codex に paste
  4. Codex が screenshot 4 枚 + self review 提出 → sir 確認

Claude に /goal で投げる場合:
  1. CH2_VISUAL_RESET.md の「/goal 起動用」block を copy
  2. claude --approval-mode full-auto で起動（無人実行したい場合）
     or 通常起動で sir が承認しながら
  3. /goal の入力欄に paste、Enter
  4. Claude が自律 loop で実装、screenshot 取得、self review 作成
  5. done when 条件満たして停止 → sir 確認

両者比較する場合:
  1. Codex 側で実装 → file 名 Chapter2WhyNow.tsx
  2. Claude 側でも実装するなら、git branch を分けるか
     Claude 側は Chapter2WhyNowClaude.tsx と命名
  3. sir が 2 つを screenshot 比較して採用判断
```
