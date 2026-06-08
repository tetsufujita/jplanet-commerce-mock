---
title: Hero (light futuristic v2) — Production Handoff Spec
updated: 2026-06-04
owner: Claude（設計）→ 実装: Codex
status: 実装可（light 採用確定・v2 プロト検証済）
ground_truth: design/prototypes/hero-light-v2/index.html（+ desktop-p00/p45/p86.png, mobile-p86.png, SELF-REVIEW.md）
supersedes: 本ファイルの旧 v1（globe 主役・light cobe）設計は**破棄**
dna: design/research/bright-infrastructure-reference-study.md
---

# Hero「light futuristic v2」本番実装仕様

> ⚠ **v1（巨大な light globe が主役）は破棄。** v2 の ground truth は `design/prototypes/hero-light-v2/index.html`。挙動・数値で迷ったら**必ずプロトを正とする**。
> 主役 = **commerce rail（Tokyo→São Paulo に Crimson pulse）＋ 立ち上がる infrastructure layer（白スラブ4層）＋ São Paulo hub（Crimson pin + glow + 都市グリッド + 座標）**。globe は**右上背景の faint な whisper**に降格。
> 目的: 投資家が最初の 5 秒で「**明るい・信頼できる・大きい市場・近未来のインフラ会社**」と感じる。トーン = Stripe/Adyen 的 bright futuristic。**第2色なし（Crimson 一点のみ）**。

---

## 0. 移植の前提（Codex 向け）
- 配置: `src/components/home/HeroLight*.tsx`（`'use client'`。canvas/scroll/イベントのみ client）。**cobe は使わない**（v2 は globe を手描き whisper に降格）。
- scroll: 既導入 **Lenis + GSAP ScrollTrigger**（Hero を pin して進行度 `p` を scrub）。
- stat: 既導入候補 **@number-flow/react**（4 マクロ数字の counter）。
- 色: **ハードコード hex 禁止** → docs/04 / tailwind トークン経由。canvas 描画は token hex を読んで使う（util）。
- 文言: `messages/{ja,en,pt-BR}.json`（§9）。固有名詞 TOKYO / SÃO PAULO・座標はロケール共通可。
- 描画は **2D canvas**（WebGL 不要）。SSR/no-JS/reduced-motion 用に**静的 SVG の最終形 fallback**を併設（§10）。

## 1. Visual target（受け入れの画）
| 状態 | スクショ | 何が映るか |
|---|---|---|
| desktop p=0（5秒の第一印象） | desktop-p00.png | 左=copy一式、右=4層スラブが組み上がり rail に Crimson pulse が Tokyo から出発。São Paulo hub（都市グリッド+pin）。背景に faint globe |
| desktop p=0.45 | desktop-p45.png | pulse が rail 中央へ |
| desktop p=0.86 | desktop-p86.png | pulse が São Paulo に到達 → hub の glow/都市グリッド pin が点灯（commerce 到達） |
| mobile p=0.86 | mobile-p86.png | scene 上・copy 下。São Paルo ラベルは node の**左**（切れ防止・§2） |

## 2. Layout values（プロト実測）
```
copy（左カラム・Stripe 非対称）:
  desktop: left 7vw / top 50% translateY(-52%)
  mobile : 下部 bottom 7vh / padding 0 24px（scene の下）
  構成（上から）: kick(Crimson 26×2px rule) → eyebrow(mono 11.5px) → H1(§6) → sub → stat → CTA×2
  sub max-width 30ch
  CTA: ① solid（Crimson 地・白字） ② ghost（白地・ink 字・1px line border）。radius 6px（硬質・Adyen/Stripe 側、pill にしない）

scene 幾何（canvas、右ゾーン / mobile 上部）:
  railY  = desktop H*0.50 / mobile H*0.34
  PX0    = desktop W*0.50 / mobile W*0.10     // platform 左
  PX1    = desktop W*0.92 / mobile W*0.90     // platform 右
  x0(Tokyo)     = PX0 + (desktop 14 / mobile 6)
  x1(São Paulo) = PX1 - (desktop 30 / mobile 14)
DPR clamp ≤ 2。
```

## 3. Color tokens（docs/04 経由・第2色なし）
```
bg(warm paper)   #F7F6F2
ink(navy)        #14213A     ← 純黒を使わない
muted            #6B7180
crimson(accent)  #C8102E     ← 一点のみ（pulse / São Paulo pin・glow / 都市グリッド最高棒 / stat 数字 / CTA solid / kick / top slab 端 / 日伯 arc）
hairline         rgba(20,33,58,.10)
dot-grid         rgba(20,33,58,.045)
slab fill        #FFFFFF（影で浮かせる）
slab shadow      rgba(20,33,58,.16) blur18 offsetY9
```
**青/緑/紫を足さない。グラデは Crimson→透明の単色のみ（pulse / glow）。**

## 4. Scene composition（主役・要素ごとの正確なパラメータ）
描画順 = 下記の順（奥→手前）。`L` = load 進行度(§5)、`p` = scroll 進行度、`spB` = São Paulo 明度。

1. **背景 dot-grid**（CSS、scene の下）: `radial-gradient(circle at 1px 1px, dot-grid 1px, transparent 1px)` size 26px。
2. **globe whisper（降格・faint）**: 中心 desktop(W*0.72, H*0.36) / mobile(W*0.5, H*0.17)、半径 desktop H*0.40 / mobile W*0.30。
   - limb 円 stroke rgba(20,33,58,.06) 1px。
   - 点 ~150（fibonacci、y を 0.6 倍に潰す）fill rgba(20,33,58,.05)。
   - **日伯 arc**: quadratic curve、stroke `rgba(200,16,46,.12)` 1px。
   - 全体 alpha 低め。**主役にしない**。
3. **perspective rails（scale/future）**: railY の上に 3 本、`y=railY - i*(desktop18/mobile14)`、stroke rgba(20,33,58, 0.06*(1-i/4))、右へ少し短く。
4. **infrastructure layers（白スラブ4層・立ち上がる）★**:
   - N=4、高さ desktop14/mobile11、gap desktop19/mobile15、幅 = PX1-PX0、radius 4。
   - y_target(i) = railY + 14 + i*(h+gap)。**rise**: 出現 y = y_target + (1-li)*40、`li = smoothstep(i*0.12, i*0.12+0.55, L)`、alpha=li（下から順にせり上がる）。
   - fill #FFFFFF ＋ shadow(rgba(20,33,58,.16) blur18 offsetY9) → **影で層が浮く**。hairline stroke rgba(20,33,58,.10)。
   - **i=0（最上段）の左端に Crimson 縦 3px のアクセント**。
5. **commerce rail（Tokyo→São Paulo）★**:
   - 線: x0→x1 @ railY、stroke rgba(20,33,58,.30) 1.5px、`railL=smoothstep(0.45,1.0,L)` で左から伸びる。
   - **Crimson pulse**（railL≈1 後）: 進行 `pf`。**forced/scroll: pf=lerp(0.10,0.97,p)**（live ループ時は時間で 0→1 巡回）。描画 = 長さ52px の Crimson→透明 gradient trail ＋ 先端 dot(r2.6, crimson)。
6. **Tokyo node**: ink dot(r3.2, rgba(20,33,58,.85))。ラベル "TOKYO"（mono 10px、node の**右** x0+8）。
7. **São Paulo hub ★**:
   - glow: radial 半径 desktop46/mobile34、`rgba(200,16,46, 0.26*spB)`→透明。
   - **都市グリッド**: 9 本の白い縦棒（skyline）。heights=[18,34,52,72,90,64,44,28,16]（mobile は ×0.62）、bw desktop4.4/mobile3、gap desktop3.4/mobile2.8、中心が x1 寄り。各棒 fill #FFFFFF＋小shadow＋hairline。**index 4（最高棒）に Crimson cap(5px)＋上に Crimson pin dot**（r=2.4+1.4*arrive）。
   - 基点 node: crimson dot(r3) @ (x1, railY)。
   - ラベル "SÃO PAULO"＋座標 "-23.56, -46.65"（mono、§2 の mobile 例外参照）。
   - `spB = 0.5 + 0.5*arrive`、`arrive = smoothstep(0.5, 0.95, p)`（pulse 到達で点灯）。

### mobile のラベル位置（切れ防止・必須）
mobile では São Paルo の "SÃO PAULO"/座標を **node の左**（右寄せ・`textAlign:right`、x1-8 起点）に配置し、画面右端で切れないようにする。desktop は node の右で可。

## 5. Motion timeline
**「5 秒で組み上がる」= load assembly（時間ベース）。その後 scroll で commerce が São Paulo へ到達して hub 点灯。**
```
L（load assembly）= smoothstep(0, 1.4s, 経過秒)   // slab rise / rail draw / 都市グリッド grow を駆動
  - slab i: smoothstep(i*0.12, i*0.12+0.55, L)（下から stagger）
  - rail  : smoothstep(0.45, 1.0, L) で左→右に伸長
  - 都市棒 j: smoothstep(0.55+j*0.045, 1.05+j*0.045, L)
p（scroll 進行度・Lenis+ScrollTrigger pin scrub）:
  - pulse 位置 pf = lerp(0.10, 0.97, p)（Tokyo→São Paulo）
  - São Paulo arrive = smoothstep(0.5, 0.95, p) → glow/pin 点灯
stat: 別途 count-up（@number-flow/react、in-view trigger）→ US$7,690億
```
- **p=0（load 完了後）で既に "完成した Hero"** が見える＝5 秒の第一印象。scroll は「商流が São Paulo に届いて hub が灯る」物語を足すだけ。
- pulse は live では穏やかにループしてよい（商流が流れ続ける示唆）。やり過ぎない。

## 6. H1（3 行固定・JA）
```
中南米に、
新しい経済の
基盤を建てる。
```
- 各行は別要素・**nowrap**（折返し禁止）。font weight 400 / `基盤` のみ **weight 580**（焦点）。size clamp(38, 4.4vw, 56)px / lh 1.14 / −0.02em / color = ink。
- load で行ごとに下から rise（stagger 0/.07/.14s）。reduced-motion で即表示。
- **色は載せない**（Crimson は scene/CTA/stat の pin-point。見出しは ink のみ）。
- en / pt-BR は messages の訳を使い、各ロケールで**自然な改行**＋強調語（基盤=foundation/base 相当）を太字に（§9）。

## 7. Implementation notes
- **scene = 単一 `<canvas>`**、rAF で描画。`p` は Lenis スクロール（GSAP ScrollTrigger で Hero を pin、scrub で 0→1）。off-screen で rAF 停止（IntersectionObserver）。resize で再 layout。
- 色は token hex を JS で `[r,g,b]` 化して canvas に。ハードコードしない。
- DPR clamp ≤ 2。`ctx.setTransform(DPR,0,0,DPR,0,0)`。
- shadow は slab/都市棒の描画時のみ（描画後 reset）。
- stat は @number-flow/react（小 `'use client'`）。in-view で 0→7690。
- 文言・数値は messages / docs から（ハードコード禁止）。

## 8. Production improvements（任意・restrained 厳守）
- 右ビジュアルの scale を一段出すなら: スラブに僅かな perspective（iso 風 top face）／都市グリッドを少し大／rail を horizon へ伸ばす。**やり過ぎると slop**。
- globe whisper の日伯 arc を僅かに濃く（Crimson alpha 微増）して「世界規模」を補助。
- pulse 到達時に São Paルo へ一瞬の ring（commerce 確定）。

## 9. i18n（messages keys・3 locale 必須）
新規 key（例。3 locale 全更新）:
```
hero.eyebrow            // "ANDES — AGENTIC COMMERCE INFRASTRUCTURE"（ロケール共通可、mono 表示）
hero.h1.line1 / line2 / line3   // ja は §6 の3行固定。en/pt は自然な改行で訳
hero.h1.emphasis        // 焦点語（ja:"基盤"）。太字対象
hero.sub                // "日本と中南米を、AI エージェントの商取引でつなぐ。物流・税務・法務までを、一つの基盤に。"
hero.stat.label         // "LATAM の EC 市場"
hero.stat.value         // 7690（数値）/ 表示は "US$7,690億"（locale で通貨/単位表現）
hero.stat.source        // "PCMI"
hero.cta.primary        // "資料請求"
hero.cta.secondary      // "事業を見る"
hero.node.tokyo / hero.node.saopaulo   // "TOKYO" / "SÃO PAULO"（共通可）
hero.coord              // "-23.56, -46.65"（共通）
```
- 公開コピーは翻案済みのみ（docs/02）。「北極星」「$1T」生表現 NG。

## 10. Fallback
- **reduced-motion（`prefers-reduced-motion: reduce`）**: rAF アニメ停止 → **load 完了・p≈0.86 の最終形を静止 1 フレーム**（4層組み上がり済・rail 全長・pulse は São Paulo 近傍 or 非表示・São Paルo 点灯・都市グリッド完成・座標表示）。H1 rise も無効（即表示）。
- **no-JS / SSR**: canvas が無い状態でも Hero が成立するよう、**静的 SVG（または CSS）で最終形を描いた fallback** を SSR で出し、JS hydrate 後に canvas に差し替え。SVG fallback には scene の最終形（スラブ4・rail・Tokyo/São Paulo・都市グリッド・globe whisper）を簡略で。
- **mobile**: scene 上・copy 下。São Paルo ラベルは node の左（§2）。負荷低（2D canvas・要素少）。
- WebGL 不要（2D canvas のみ）なので no-WebGL 分岐は不要。

## 11. Strict exclusions（厳守）
- **no giant globe**（globe は背景 whisper のみ・主役にしない）。
- **no blue / purple / 第2色**（Crimson 一点 ＋ 近黒インク ＋ warm paper のみ）。
- **no purple/blue gradient slop**（グラデは Crimson→透明の単色だけ）。
- **no dashboard card clutter**（カード羅列・UI チップ羅列をしない。要素は scene + copy のみ）。
- Hero に **SISCOMEX / PIX / NF-e / CNPJ / compliance strata / infra 名の大量表示を入れない**（→ Platform/Portfolio）。
- public NG（北極星 / 中南米の王 / $1T 生表現 / PRC 唯一・24ヶ月先行 / Series A 機密）を出さない。
- Claude は src/ を触らない（実装は Codex）。

## 12. PASS 条件（done の定義・e2e 検証）
- [ ] 左 copy（kick→eyebrow→H1 3行→sub→stat→CTA2）が `desktop-p00.png` と一致。**H1 は中南米に、/ 新しい経済の / 基盤を建てる。の 3 行固定**（`基盤` 太字）。
- [ ] 右 scene: **白スラブ4層が下から立ち上がり影で浮く**／**rail に Crimson pulse が Tokyo→São Paulo**／**São Paルo = Crimson pin + glow + 都市グリッド + 座標**／**globe は右上 faint whisper**。
- [ ] p=0/0.45/0.86 が desktop-p00/p45/p86 と概ね一致（pulse 進行・São Paルo 点灯）。
- [ ] mobile 375×812: scene 上・copy 下、São Paルo ラベルが**切れない**（node 左）。
- [ ] 色は **Crimson 一点のみ**（青/緑/紫なし）、インク濃紺、warm paper。グラデは Crimson 単色。
- [ ] §11 除外が一切ない（giant globe / card clutter / 第2色 / infra 名 なし）。
- [ ] reduced-motion 静止最終形 / no-JS SVG fallback / mobile 成立。
- [ ] 文言 messages 3 locale・色トークン・stat=@number-flow。`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 緑。

## 13. Codex タスクテンプレ（そのまま渡せる）
```
Goal:       Hero「light futuristic v2」本番実装。主役=commerce rail(Tokyo→São Paulo の Crimson pulse)+立ち上がる白スラブ4層+São Paulo hub(Crimson pin/glow/都市グリッド/座標)。globe は右上背景 whisper。
Context:    本 spec / ground truth=design/prototypes/hero-light-v2/index.html(+スクショ) / DNA=design/research/bright-infrastructure-reference-study.md / docs/04(色) / docs/09(Lenis+GSAP)
Constraints: AGENTS.md('use client'最小/any禁止/messages 3 locale/hex禁止) / §11 strict exclusions(giant globe・第2色・card clutter・infra名・src以外触らない) / reduced-motion・no-JS SVG・mobile ラベル左 必須
Done when:  §12 PASS を全て満たし lint && typecheck && test && build 緑
```

## 14. 関連
ground truth=design/prototypes/hero-light-v2/ / DNA=design/research/bright-infrastructure-reference-study.md / docs/12(vision) / docs/04(色) / docs/02(翻案) / docs/09(scroll stack) / design/research/brazil-visual-language.md(São Paulo/都市グリッドの上品さ) / 旧 dark 案=design/specs/hero-dark-cosmos-production-spec.md(不採用)
