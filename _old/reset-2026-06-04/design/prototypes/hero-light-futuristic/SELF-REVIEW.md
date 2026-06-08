# Hero「light futuristic」prototype — self-review

2026-06-04 · `design/prototypes/hero-light-futuristic/index.html`（自己完結・cobe 同梱・`open` で動く・`?p=` で進行度固定）
スクショ: `desktop-p00.png` / `-p45.png` / `-p86.png` / `mobile-p86.png`（降下後 = São Paulo 点灯）。
目的: **本番でなくトーン判断用**。dark cosmos 版（`../hero-dark-cosmos/`）と並べて比較するための light 案。

## 仕様（bright DNA）の充足
| 必須 | 状態 |
|---|---|
| cobe **light** globe（dark:0） | ✅ 明るい dotted 地球（薄グレー land）。実大陸が読める |
| white / warm paper base | ✅ #F7F6F2 + 中立ドットグリッド blueprint |
| Crimson pin-point only / no purple-blue slop | ✅ **第2色ゼロ**。Crimson は São Paulo / CTA / 数字 / dot だけ |
| São Paulo 点灯 + Tokyo ⇄ São Paulo | ✅ 2 marker、降下で São Paulo が灯る（核 + 淡輪 + bloom ring） |
| Stripe / Adyen 的 bright futuristic 感 | ✅ 細ウェイト見出し(380/−0.022em) + 出典付き数字 + CTA 2 + 精度・余白 |
| no dashboard card clutter | ✅ カード羅列なし。globe + コピー + CTA のみ |

## 比較観点（dark vs light）正直評価
1. **dark より読みやすいか → ◎ 明確に light が上**。白地 + 濃紺インク + 細見出しで「document clarity」。長文・数字が読みやすい。
2. **投資家向けの信頼感 → ◎ light が強い**。stat(US$7,690億[PCMI]) + CTA + restraint で Stripe/Adyen の enterprise/IR 格。dark は「ビジョン/野心」、light は「信頼できるインフラ」。
3. **Stripe 風の明るい近未来感 → ○〜◎**。第2色を使わず、light globe + dot-grid blueprint + 微 Crimson wash + 精度で futuristic。**Stripe clone ではない**（レインボー無し）。
4. **Brazil / São Paulo の上品さ → ○**。São Paulo の Crimson + 座標 + Av. Paulista hairline は上品。ただし**「灯る瞬間」は light の方が弱い**（白地は glow が飛ぶ）。核 dot + bloom ring で補うが、ドラマは dark に劣る。
5. **Andes 独自性 → ◎**。dotted globe + 日本⇄ブラジル + São Paulo + Crimson-only は Stripe(製品 screenshot/レインボー)とも generic SaaS とも違う。dark 版と globe DNA を共有＝一貫性。

## dark / light のキャラ差（トーン判断材料）
| | dark cosmos | light futuristic |
|---|---|---|
| 第一印象 | 静寂・畏れ・ビジョン | 明晰・信頼・近未来インフラ |
| 読みやすさ | 中 | **高** |
| São Paルo 灯る瞬間 | **強い**（闇に glow） | やや弱い（核 dot で補う） |
| 投資家の信頼感 | ビジョン寄り | **クレデンシャル寄り** |
| 手本 | Igloo / Apple cinematic | Stripe / Adyen |

## 弱い点 / 申し送り
- **São Paルo の "灯る" は light だと控えめ**。白地で glow が飛ぶため。本番で強める手は「核 Crimson を濃く」「bloom ring を一瞬だけ強調」「São Paルo 近傍だけ globe を僅かに暗く落として contrast を作る」。それでも dark のドラマには届かない（トーンの本質差）。
- cobe light は僅かに "3D プラスチック球" の艶（cobe の陰影）。`mapBaseBrightness`/`diffuse` で調整可。よりフラットにするなら下げる。
- 微 Crimson wash と dot-grid は extremely subtle（意図どおり）。もっと Adyen ピュアにするなら wash を消す。
- stat は count-up（Stripe 流）を仮実装。本番は @number-flow/react + 出典確定。

## 結論（私の見立て・決定は sir）
- **投資家向けの "信頼・読みやすさ" 優先なら light**、**"ビジョン・記憶に残る畏れ" 優先なら dark**。両者は globe DNA を共有するので、選ぶのは純粋にトーン。
- 投資家サイトという目的だけ見れば **light がやや有利**（Stripe/Adyen の格・可読性）。ただし Andes の「中南米に新しい基盤を建てる」野心を一撃で焼き付けたいなら dark。
- 折衷（dark hero → light 本文 / または light hero に dark の数字章）も docs/12 で言及済。
