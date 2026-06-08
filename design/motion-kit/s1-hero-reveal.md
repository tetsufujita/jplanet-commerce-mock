# s1 — Hero の宣言 reveal

- **要件（何を理解させる）**: 宣言「中南米に、新しい経済の基盤を建てる。」を 5 秒で読ませ、最先端で落ち着いた第一印象を作る。
- **手本（1 サイト）**: **Linear**（staggered text reveal の restraint）。品質の天井。
- **付け方**:
  - なぜ: 読了を誘導（line1→2→3 を順に視線で追わせる）。
  - どこで: hero の見出し各行。
  - いつ: **load 時に 1 回**（scroll でない）。
- **抑制**: stagger `--stagger`(70ms) / 振幅 `--rise`(12px) / 全体 `--dur-slow`(700ms) / ease=`--ease-andes`。
- **実装**: 既存 `src/components/motion/Reveal` を**行/ブロック単位**で stagger（改行位置に依存しない＝i18n 安全）。文字単位が要れば GSAP SplitText 3.13（日本語は Noto・字間注意）。
- **任意の主役+α**: agent フロー（巨人 LLM → Andes agent → LATAM infra）の **line-draw 1 本を once**（SVG `stroke-dasharray` + `@gsap/react`、依存追加ゼロ）。「2 層構造の予告」を機能的に伝える 1 本だけ。
- **反例（やらない）**: 背景の動く gradient 全面 / globe・cosmos（reset で廃案） / cursor 追従 / parallax / ループ。
- **reduced-motion**: 行は即表示、line は描画済で静止。
