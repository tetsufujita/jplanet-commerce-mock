# Hero light v2 — self-review

2026-06-04 · `design/prototypes/hero-light-v2/index.html`（自己完結・依存ゼロ・`open` で動く・`?p=` 固定）
スクショ: `desktop-p00.png`（5 秒の第一印象）/ `desktop-p45.png` / `desktop-p86.png`（commerce が São Paulo へ到達・hub 点灯）/ `mobile-p86.png`。
目的: light v1 をそのまま本番化せず、**投資家が 5 秒で「明るい・信頼・大きい市場・近未来インフラ」**と感じる Hero に詰める。

## v1 → v2 で変えたこと（方向の反映）
| 指示 | v2 での実装 |
|---|---|
| globe を主役から背景要素へ降格 | globe は**右上背景の faint な whisper**（limb + 点 + 日伯 arc・alpha 低）に。主役から外した |
| commerce rail / infrastructure layer が立ち上がる Hero | **主役を差し替え**: 白スラブ 4 層が**下から立ち上がる**（infrastructure layer）＋ Tokyo→São Paulo の **commerce rail** に Crimson pulse が流れる |
| São Paulo / Brazil を Crimson pin + 都市グリッド | rail 右端に **São Paulo の都市グリッド（白い棒の skyline）＋最も高い棒を Crimson pin**、glow、座標 |
| H1 の日本語改行・視線誘導 | 3 行に再設計「中南米に、/ 新しい経済の / **基盤**を建てる。」。各行 nowrap・descending・`基盤` を太字で焦点化 |
| 巨大な白い地球デモを廃す | 廃止。globe は脇役、infra が主役 |
| Stripe / Adyen 的 bright futuristic | warm paper + 濃紺インク + Crimson 一点 + dot-grid blueprint + kick rule + eyebrow「AGENTIC COMMERCE INFRASTRUCTURE」+ 出典付き stat + CTA 2（solid/ghost）。**第2色ゼロ** |

## 5 秒の読み（目的の達成度）
- **明るい → ◎** warm paper・余白・白スラブ。
- **信頼できる → ◎** Adyen 的 restraint・stat（US$7,690億［PCMI］）・実 CTA・濃紺インク。
- **大きい市場 → ○〜◎** stat の大きい数字 ＋ rail が右へ伸びる scale 感。
- **近未来インフラ → ○〜◎** 立ち上がる layer ＋ commerce rail ＋ 流れる pulse ＋ São Paulo 都市。globe whisper が「世界規模」を補助。

## 仕様（bright DNA）の遵守
✅ Stripe/Adyen bright futuristic ／ ✅ dark cosmos 不採用 ／ ✅ globe 背景降格 ／ ✅ São Paulo = Crimson pin + 都市グリッド ／ ✅ H1 改行改善 ／ ✅ commerce rail + 立ち上がる layer ／ ✅ no purple/blue gradient slop（**第2色なし**）／ ✅ no dashboard card clutter（カード羅列なし）。

## 弱い点 / 本番への申し送り
1. **右の infra ビジュアルは restrained（やや控えめ）**。Adyen 的で credible だが「大きさ・wow」をもう一段出すなら: スラブに僅かな perspective（iso 風）を与えて "platform" 感を強める／São Paulo 都市グリッドを少し大きく／rail を horizon へ伸ばして scale を強調。やり過ぎると slop なので慎重に。
2. **mobile で São Paulo ラベルが右端で軽く切れる**（`SÃO PAUL…`）。本番は node の**左側にラベル配置** or 右マージン確保で解消。
3. **globe whisper は非常に淡い**（意図どおりだが）。「日伯接続」をもう少し感じさせたいなら arc を僅かに濃く（Crimson alpha +）。
4. これは **canvas プロト**。本番は React/Tailwind・色トークン・文言 messages 3 locale・scroll は Lenis+GSAP・stat は @number-flow/react・reduced-motion/no-canvas は**静的 SVG fallback**。

## 本番 spec への影響
`design/specs/hero-light-futuristic-production-spec.md` は **v1（globe 主役・light cobe）前提**。v2 は方向が変わった（globe 降格・commerce rail/layer 主役）ので、**spec を v2 に更新してから Codex に渡す**必要がある。次アクション候補。

## 判定
方向（commerce rail / infrastructure layer 立ち上がり・globe 降格・São Paルo 都市グリッド・H1 改善）は満たした。investor 5 秒の 4 要素も成立。残りは「右ビジュアルの scale をどこまで出すか」の微調整と、本番 spec の v2 更新。
