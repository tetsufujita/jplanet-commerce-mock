# s3 — 2 層構造の順次 reveal

- **要件**: ①購入エージェント ②現地プラットフォーム ③→protocol の **2 層"構造"を順序で理解させる**（装飾でなく説明）。
- **手本（1 サイト）**: **Linear / Stripe**（関係を示す line draw / 順次 reveal の機能的 motion）。
- **付け方**:
  - なぜ: 「2 層がどう積み上がるか」を順序で理解させる。
  - どこで: §3 の ①→②→③ と、それを繋ぐ line。
  - いつ: scroll で in-view、**once**。
- **抑制**: 順次 reveal は stagger `--stagger` / line は `--dur-count` 上限・ease=`--ease-andes`。
- **実装**: GSAP **ScrollTrigger**（無料）or CSS `animation-timeline: view()` + `@supports` fallback（軽い方）。line は SVG `stroke-dasharray`。
- **反例**: card の自動 hover ツアー / 3D / 大袈裟 parallax / 常時アニメ。
- **reduced-motion**: 3 ブロック・line とも完成形を静止表示。
