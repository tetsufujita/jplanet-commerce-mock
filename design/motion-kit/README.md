# motion-kit — Andes の効果処方箋（src/ ではない・Codex が読む）

> ★STACK 固定 2026-06-04: 実装は **Motion（`motion/react`）一本**。**s1–s5 ファイル内の GSAP / Lenis / `@gsap/react` / SVG+gsap / split-type 等の記述は Motion 等価に読み替える**:
> reveal/stagger=`motion.div`+variants+`whileInView`(once) / scroll連動=`useScroll`+`useTransform` / 線描画=`motion.path`の`pathLength` / 数字=`useSpring` か `@number-flow/react`。GSAP/Lenis/Three は**使わない**。

> 方針（専門家パネル 2026-06-04 確定）: **「効果を広く集める」のでなく「IA(docs/07 の8 section)から要る効果を逆算 → 効果ごとに最良の1手本を学ぶ → 同一 token に正規化した小さな kit にする」**。
> 「集める」のでなく「測って 1 つのリズムに統一する」= premium の正体。

## ルール
1. **1 entry = 1 section の 1 要件**。section に紐付かない effect は作らない。
2. 各 entry に必ず **〔なぜ効くか〕〔どこで〕〔いつ(トリガ)〕** ＝ 効果の"付け方"。
3. **手本は効果ごとに 1 サイトだけ**引用（全部 Stripe にしない）。
4. `_rejected.md`（入れない effect と理由）を必ず持つ＝盛りたくなったら見る。
5. 全 effect は `00_tokens.md` の唯一の easing/duration に従う。**Motion（`motion/react`）で自作**（既存 Next.js 実装は `_old/`・流用しない）。**外部取得は最大 1 個**（数字に `@number-flow/react` を使うなら、それが Motion ベースなので可）。

## 主役 motion はサイト全体で実質 4 つ
`s1-hero-reveal` / `s2-numbers-count` / `s3-twolayer-sequence` / `s5-group-draw`。
§4/§7 は静止（入場 Reveal のみ）、§6/§8 は hover のみ。**動かす section 最大 3、1 画面 1 主役。**

関連: docs/07 §4 / docs/04 アニメーション / docs/08 要件 #9。
