# Codex Chapter 1 visual reset prompt

> 前回の Ch.1 が checklist 完遂モードで cinematic 感ゼロだった反省を受けた reset。
> visual layer のみ捨て、Lenis/GSAP/i18n base は残す。
> Ch.1 を frame-by-frame で組み直す。Ch.2-7 は一切触らない。
> 完了報告は実装文言 NG、desktop @1440px + mobile @375px の screenshot 2 枚必須。
> 本 file の「貼り付け本文」を Codex に渡す。

---

## 貼り付け本文（Codex に渡す）

```
STOP — Chapter 1 を visual reset する。前回の自己診断（"checklist 完遂モードに入って
cinematic 感を握れていなかった"）に同意。reset 計画も OK。

ただし、今度は spec を frame-by-frame で渡す。conceptual ではなく literal。
checklist で組むのではなく、「この 1 frame を再現する」task として組む。

================================================================
SCOPE（厳守）
================================================================

- src/components/chapters/Chapter1Overture.tsx を書き直す（in place）
- src/components/cinematic/PaintCanvas.tsx を書き直す（subtle 化）
- Lenis / GSAP / i18n / Header / Footer / 既存 stack は keep
- Chapter 2-7 のファイル / spec / 実装は **絶対に触らない**
- 旧 Stripe 風 file（src/components/sections/Hero.tsx, PageHero.tsx）は削除 OK
- src/app/[locale]/page.tsx は keep（Chapter1Overture のみ render する現状でよい）

================================================================
PHILOSOPHY（前回の失敗を繰り返さないため）
================================================================

cinematic = 「1 frame として完成度高い静止画 + その間の motion」。
checklist = 「animation 動いた / scrub 効いた / 7 章実装した」。
このタスクは 100% 前者。

「動いた」では不合格、「美しい」で合格。
詰まったら、tweak よりも「reference frame に近づいているか」を毎回問い直す。

================================================================
REFERENCE FRAMES（必ず見る）
================================================================

下記 2 URL を WebFetch or 内蔵 browser で開き、Hero screen の構図・余白・
タイポ階層・色 contrast・光の入り方を観察してから実装する:

1. https://www.apple.com/apple-vision-pro/  （pure dark + massive product name）
2. https://www.apple.com/apple-watch-ultra-2/  （dark cinematic Hero）

特に観察してほしいこと:
- 文字以外がほぼ何もない（"decoration を足さない" 美学）
- 文字の周りに viewport の 40% 以上の余白
- 背景は単色 or 単色 + subtle gradient（gradient が cheap LP 風にならない理由）
- letter spacing が tight（-0.04em ぐらい）
- type は 1 階層大きい、subtitle は明確に小さい

これを Andes Ch.1 でやる。完全に同じ「構図」、文字だけ Andes copy に置換する。

================================================================
EXACT VISUAL SPEC — DESKTOP（1440px viewport）
================================================================

LAYOUT:
  section: min-h-[300vh] relative overflow-clip
  sticky inner: min-h-screen sticky top-0 flex items-center
  content container:
    position: 縦中央、横左寄せ
    max-width: 760px
    padding-left: 120px（120px は固定、レスポンシブで縮小）
    padding-right: 24px
    padding-bottom: 0（縦中央なので bottom padding 不要）

  ⚠️ 右側に decoration カラム / radial gradient / 円 は **置かない**。
     文字だけ。Apple Vision Pro の構図と同じく、余白を恐れない。

TYPOGRAPHY — line1 (「AI が売り、AI が買う。」):
  font-family:    Noto Sans JP（日本語）
  font-weight:    700 (Bold)
  font-size:      88px   ⚠️ clamp 禁止、固定 px
  line-height:    1.02
  letter-spacing: -0.04em
  color:          rgb(250, 250, 247)  /* #FAFAF7 */
  opacity:        0 → 1
  margin-bottom:  0（line2 が同じ size で直下）

TYPOGRAPHY — line2 (「その下に、Andes がある。」):
  font-family:    Noto Sans JP
  font-weight:    700
  font-size:      88px
  line-height:    1.02
  letter-spacing: -0.04em
  color:          rgb(250, 250, 247)
  margin-top:     0

TYPOGRAPHY — line3 (「─ 中南米 5 億人の生活基盤を、いま建てる。」):
  font-family:    Noto Sans JP
  font-weight:    500 (Medium)
  font-size:      22px   ⚠️ 明確に小さい、subtitle scale
  line-height:    1.55
  letter-spacing: -0.01em
  color:          rgba(250, 250, 247, 0.62)
  max-width:      540px
  margin-top:     64px  ⚠️ line2 から大きく離す（空気を入れる）

CTA row:
  margin-top:     56px
  display:        flex gap 12px

CTA primary（「事業を見る」→ /[locale]/businesses）:
  background:     rgb(250, 250, 247)  /* paper */
  color:          rgb(6, 11, 31)      /* deep */
  padding:        14px 28px
  border-radius:  9999px              /* pill */
  font-size:      14px
  font-weight:    600
  letter-spacing: 0.01em
  hover:          opacity 0.88、scale なし

CTA secondary（「Andes について」→ /[locale]/about）:
  background:     transparent
  border:         1px solid rgba(250, 250, 247, 0.32)
  color:          rgb(250, 250, 247)
  padding:        14px 28px
  border-radius:  9999px
  font-size:      14px
  font-weight:    600
  letter-spacing: 0.01em
  hover:          border-opacity 0.6、bg paper/8

================================================================
EXACT VISUAL SPEC — MOBILE（375px viewport）
================================================================

LAYOUT:
  padding-left:  24px
  padding-right: 24px
  content vertical: 縦中央

TYPOGRAPHY — line1, line2:
  font-size:      40px  ⚠️ desktop の 88 から大幅縮小
  line-height:    1.08
  letter-spacing: -0.03em
  color:          rgb(250, 250, 247)

TYPOGRAPHY — line3:
  font-size:      15px
  line-height:    1.55
  letter-spacing: -0.005em
  color:          rgba(250, 250, 247, 0.62)
  max-width:      100%
  margin-top:     48px

CTA row:
  flex-direction: column or wrap、各 button full-width OK
  margin-top:     40px
  gap:            10px

CTA padding: 12px 24px、font-size 13px

================================================================
BACKGROUND SPEC（重要、前回ここで cheap LP 化した）
================================================================

BASE:
  body / html background は固定で rgb(6, 11, 31) /* #060B1F = midnight = deep */
  scroll progress 0% → 60% の間: 完全に midnight、何も足さない
  ⚠️ いきなりオレンジを混ぜない。前回のように茶色グラデになる。

DAWN GLOW（scroll progress 60% → 100% で出現）:
  位置: viewport bottom から 40vh の高さ
  形:   radial-gradient(ellipse at 50% 100%, #FF8A3C 0%, transparent 70%)
  opacity:
    scroll 60% → 0
    scroll 80% → 0.4
    scroll 100% → 0.85
  blend-mode: screen（背景 midnight に光を足す）
  ⚠️ background 全体を blend するのではなく、horizon glow として下から滲ませる

→ 効果: 上 60% は宇宙のように深い navy、下から朝日が昇る印象。
   midnight × dawn の「線形 lerp」ではない（前回はこれで茶色になった）。

PAINT TEXTURE（WebGL、desktop only、subtle 化）:
  PaintCanvas を書き直す:
    - cursor が動いた position に、半径 80px / opacity 0.04 の白い soft brush stroke
    - 各 stroke は 1.5 秒で fade-out
    - 残像 max 12 stroke、それ以上は古いものから消える
    - color: white、blend-mode: screen（midnight を僅かに明るくする）
  ⚠️ 前回は paint が騒がしすぎた。今回は「ほぼ見えない」level、
     cursor を動かしてやっと薄く残像が見える程度。

MOBILE:
  PaintCanvas は dynamic import の ssr:false + 解像度 check で skip。
  fallback: 何も足さない（midnight 単色のまま）。
  ⚠️ mobile に gradient fallback は不要、midnight + dawn glow だけで足りる。

================================================================
ANIMATION SPEC
================================================================

INITIAL REVEAL（page load 後、scroll 0 で発火）:

  line1:
    delay: 0.4s
    duration: 0.7s
    ease: cubic-bezier(0.16, 1, 0.3, 1)
    from: opacity 0、translateY 24px、blur 6px
    to:   opacity 1、translateY 0、blur 0
    split: SplitType chars + stagger 0.025s（左から右）

  line2:
    delay: 1.4s
    （他は line1 と同じ）

  line3:
    delay: 2.4s
    duration: 0.6s
    from: opacity 0、translateY 16px
    to:   opacity 0.62、translateY 0
    split: none（一塊で fade-up）

  CTA row:
    delay: 3.2s
    duration: 0.6s
    from: opacity 0、translateY 12px
    to:   opacity 1、translateY 0

SCROLL ANIMATION（ScrollTrigger scrub:1 で section に紐付け）:

  content scale + y:
    scroll 0% → 100%
    scale: 1 → 0.92
    translateY: 0 → -40px
    ease: none

  text opacity（下方向にスクロールで text が薄れて消える）:
    scroll 60% → 1
    scroll 90% → 0
    （朝日が昇りきると text は消える、cinematic な切り替わり）

  dawn glow opacity:
    （Background SPEC 参照）

REDUCED MOTION:
  prefers-reduced-motion: reduce 時:
    - 全 GSAP animation 即時完成状態（opacity 1, translateY 0, blur 0）
    - paint canvas を skip
    - dawn glow を opacity 0.5 で fix（scroll 連動しない）

================================================================
WORKFLOW（前回と違う submission 形式）
================================================================

実装完了の合格条件は **screenshot を見て美しいか** のみ。
「pnpm build pass」「lint pass」は当然の前提、それだけでは合格ではない。

実装後、必ず以下を実行して提出:

1. pnpm dev を起動
2. desktop（1440x900）でブラウザを開き scroll 位置 0% の screenshot を撮る
3. desktop で scroll 位置 80% の screenshot を撮る（dawn glow が見える）
4. mobile（375x812）で scroll 位置 0% の screenshot を撮る
5. 4 枚の screenshot のパス（or 添付）+ pnpm dev URL を提示
6. 「自己評価」を 3 行で書く:
   - Apple Vision Pro / Active Theory の Hero に近いか（0-10）
   - 文字の余白・タイポ階層が決まっているか（0-10）
   - 動かない静止画として美しいか（0-10）
   3 軸とも 7 以上でなければ、提出前に自分で直す。

HALLMARK SELF-CRITIQUE:
  .agents/skills/hallmark/SKILL.md にある self-critique gates を、
  Chapter1Overture.tsx の最終 emit 前に走らせる。
  6 軸（Philosophy / Hierarchy / Execution / Specificity / Restraint / Variety）
  すべて 4 以上になるよう内部 revision。

================================================================
DON'T（前回の失敗を繰り返さない）
================================================================

- midnight と dawn を background-color として線形 lerp で混ぜる
  → 必ず茶色 / 濁った gradient になる。今回は horizon glow only。
- decoration 円 / radial card / ambient lines を文字以外に置く
  → checklist 完遂感が出るだけで cinematic にならない。文字だけ。
- font-size を clamp で書く
  → 88px / 40px の exact 数値。レスポンシブは breakpoint で切替。
- 文字を center 揃え
  → 左寄せ。Apple Vision Pro と同じく left-align。
- CTA を sharp 角（rounded-md 等）
  → pill (rounded-full)。premium feel のため。
- Chapter 2-7 のファイルを変更する
  → 触らない。Ch.1 のみ。
- screenshot 提出を省略
  → 必須。screenshot なしの完了報告は無効。
- 「動いた」「build pass」だけで合格判定
  → 静止画として美しくないと不合格。

================================================================
開始順
================================================================

1. 上記 2 reference URL を WebFetch で開き、Hero の構図を観察
2. PaintCanvas を subtle 化（cursor stroke 残像、opacity 0.04 level）
3. Chapter1Overture を spec 通り書き直し
4. desktop @1440x900 で 2 枚 + mobile @375x812 で 2 枚 screenshot
5. 自己評価 3 軸 + Hallmark 6 軸を内部で通す
6. 全部 7+ なら提出、足りなければ revision

Chapter 2-7 は触らない。Ch.1 完了して sir OK が出るまで。
```

---

## sir 操作

```
1. CODEX_CH1_VISUAL_RESET.md を開く
2. 中の「貼り付け本文」を copy
3. Codex に paste、Codex が reset 開始
4. Codex が screenshot 4 枚を出してきたら sir 確認
5. 美しい → Ch.2 へ進める prompt 発行
6. 物足りない → 具体的に何が物足りないか言って Codex に reset の reset
```

---

## なぜ前回はだめだったか（記録）

```
原因                            対処（本 prompt で）
─────────────────────────────────────────────────────────
spec が conceptual              exact px / color stop / letter spacing
"動いた" で合格判定              screenshot 必須、静止画で美判定
midnight → dawn 線形 lerp        horizon glow only、上は midnight 維持
decoration を足してしまう         文字以外置かない、Apple 構図 literal
clamp() のフレキシブル size        88px / 40px exact、breakpoint で切替
Codex の self-critique なし       Hallmark 6 軸 gate を強制
```
