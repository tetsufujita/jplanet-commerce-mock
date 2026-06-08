---
title: Animation Stack Recommendation — section 別 motion approach
updated: 2026-06-04
status: research 結論（section ごとの最適 motion）
---

# Animation Stack Recommendation（section 別）

> 各 section に最適な motion approach。ビジョン = 宇宙の俯瞰から日本⇄ブラジルへ降り、エージェンティックコマースの弧が増殖し、事業に着地する一本のシネマ。
> 共通: 色2つ（近黒+Crimson #C8102E pin-point）/ MotionGate で reduced-motion 静止 / mobile は DPR clamp + count 削減 / R3F canvas は基本 1 枚。

## 全体の通し（スクロール＝カメラ）
`Lenis + GSAP ScrollTrigger + @gsap/react`（既導入）で全章を pin/scrub。スクロールが「宇宙→地球→南米→着地」のカメラ移動を駆動する。各章は ScrollTrigger の 1 セグメント。

```
[宇宙俯瞰] → [地球+2光点] → [弧が増殖] → [南米へ降下/数字] → [2層インフラ] → [事業] → [長期/CTA]
   Hero ──────────────── corridor ──── Market ──── Platform ──── Portfolio ── Closing
```

---

## 1. Hero
**狙い**: 沈黙と畏れ。闇の宇宙に地球、日本とブラジルが灯る。宣言一行。
- 背景土台: **drei `<Stars saturation={0}>`**（白星野）＋ **`<Sparkles color="#C8102E">`** 少数（pin-point）。
- 主役: **cobe**（闇の地球・自転、`glowColor`/`markerColor`=Crimson、日本/São Paulo に marker）。scroll で phi を回し降下開始。
- 文字: **GSAP SplitText** で宣言コピーを行マスク reveal。
- 大気（任意・どちらか一方）: **@shadergradient/react** の近黒→Crimson 低速 gradient。
- desktop 限定アクセント（任意）: react-fluid-distortion（mobile/RM は off）。
- fallback: RM → 自転停止・星 speed=0・静止 globe。mobile → DPR clamp、Sparkles count 減。
- ⚠ R3F canvas は 1 枚に集約（Stars/Sparkles/globe を同 scene に）。cobe は独立 canvas なので、drei 星野と二重 canvas にするなら mobile で要計測 → 重ければ星野は cobe の glow に寄せて 1 canvas 化。

## 2. Market problem（市場の大きさ＝機会）
**狙い**: 分断された巨大市場を数字で突きつける。
- 数字: **@number-flow/react**（6.6億人 / US$7,690億 / 2.1億人 / 1.7億人）。IntersectionObserver で in-view trigger、極短ラベル。
- 章転換: **GSAP ScrollTrigger + SVG mask** の全画面 reveal を 1 パターンだけ（Hero→Market の幕開け）。
- 文字: 数字の補足を **Motion** の `whileInView` で控えめ stagger。
- 避ける: Remotion 動画、派手な背景。数字に語らせる（restrained）。

## 3. Platform architecture（2 層構造）
**狙い**: ①購入エージェント（表層・ブランディング）/ ②プラットフォーム（深層・物流/税/法/通関）を「動く図」で。
- 第一候補: **Rive**（MIT runtime・state machine）。hover/scroll で 2 層が展開＝「生きてる infra」。
- 代替: **SVG + GSAP**（DrawSVG で線が描かれる、pin で部品が組み上がる）。generic 回避には手描きが安全。
- 構造化が要れば: **@xyflow/react v12**（animated edge）だが**重カスタム必須**（色2/流れ/editor 風味除去）。
- 導入演出: **Codrops On-Scroll Layout Formations**（部品が pin されてインフラに組み上がる）。
- 背景: drei `<Stars>` を遠景に薄く。

## 4. Japan-Brazil corridor ★見せ場
**狙い**: 二点を結ぶ弧が一本→無数に増殖＝エージェンティックコマースのフロー。
- 主役: **three-globe**（Arcs Layer）。`arcStartLat/Lng`(日本)→`arcEndLat/Lng`(São Paulo)、`arcColor`=近黒→Crimson gradient、`arcDashLength/Gap/AnimateTime` で dash が great-circle 上を流れる。scroll で arc 配列を append し増殖。
- 別案: **GSAP MotionPath** で 1 パケットが弧を通過（より restrained）。
- fallback: WebGL 不可/RM → **d3-geo `geoInterpolate`** の静的 SVG arc（2D・軽量）。
- mobile: arc 本数に上限、devicePixelRatio clamp、RM は静止フレーム。
- 注意: cobe(Hero) と three-globe(corridor) は別系統。Hero で cobe → corridor で three-globe にバトン、が現実的（または全編 three-globe 1 本に統一して canvas を使い回す案も検討）。

## 5. Portfolio / group structure
**狙い**: 抽象から実事業（J-Planet 等）へ着地。EC 証拠はここに隔離。
- reveal: **Motion** の stagger reveal + `next/image`。控えめに。
- premium にするなら: **Codrops Scroll-Revealed WebGL Gallery**（WebGL plane を DOM グリッドに整列、uProgress reveal）。ただし重いので mobile は静的 image に。
- group structure 図: **SVG + GSAP**（親子の階層を線で）。
- 避ける: 過剰演出。事実（事業・実績）を静かに。

## 6. Closing CTA
**狙い**: 静けさに戻り、長期視点で締める。
- 背景: **@shadergradient/react** の近黒→Crimson を最小限、または drei `<Stars>` を speed 落として残光。
- コピー: 対句（「今日の一歩。世代の基盤。」）を Motion で静かに reveal。
- CTA: 投資家窓口（ir@andes.global）。Crimson は CTA に 1 点だけ。
- 避ける: 重い 3D、動きすぎ。restrained に締める。

---

## 新規依存（このビジョンで足すもの）
```
cobe                  # Hero globe（5KB・MIT）
three-globe           # corridor arc 増殖（MIT・three 共有）
@shadergradient/react # 大気 gradient（MIT）
@number-flow/react    # 4 マクロ数字（MIT）
@rive-app/react-canvas# 動く図（任意・MIT runtime）
d3-geo                # corridor の 2D fallback（ISC）
```
既導入で賄う: gsap / @gsap/react / lenis / three / @react-three/fiber / @react-three/drei / framer-motion / split-type。
**Remotion は runtime 不使用**（会社規模で有償）。`@remotion/noise`(MIT) を星雲ゆらぎに使うのは可。

## 実装の順序（提案）
1. Hero プロトタイプ（cobe + 星野 + SplitText + scroll 降下）を独立 demo で検証 → 質感 OK を sir 確認
2. corridor（three-globe arc 増殖）を独立 demo で検証
3. OK なら docs/ に section spec を確定 → Codex が src/ 実装（done=lint/typecheck/test/build 緑、reduced-motion/mobile fallback 必須）

## 出典
リサーチ 2026-06-04（fetch 実在確認）。matrix: design/research/animation-template-matrix.md / shortlist: design/research/motion-shortlist.md。vision: docs/12（site vision・globe/corridor）。
