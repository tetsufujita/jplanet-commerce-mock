# Hero prototype — dark cosmos / self-review

2026-06-04 · `design/prototypes/hero-dark-cosmos/index.html`（自己完結・依存ゼロ・ビルド不要）
スクショは降下後（São Paulo 点灯）状態 `?p=0.86`。ライブは `open index.html` で scroll 駆動。
- `desktop-1440x900.png` / `mobile-375x812.png`

## 仕様の充足
| 要件 | 状態 |
|---|---|
| Tokyo と São Paulo の 2 点だけ Crimson | ✅ marker は 2 点のみ。色は近黒+白系 dot + Crimson だけ（2色厳守） |
| scroll descent で São Paulo が静かに明るくなる | ✅ `spBright = smoothstep(0.34,0.92,p)`。glow とコア dot が p で増光 |
| 座標 `-23.56, -46.65` を monospace 極小 | ✅ São Paulo に追従配置、reveal で fade-in |
| Av. Paulista を hairline 1 本でうっすら | ✅ São Paulo を貫く 1px Crimson 線（低 alpha） |
| city-light cluster（procedural 可） | ✅ São Paulo 周囲に 34 点の簡易クラスタ（Black Marble の代用） |
| Hero に infra 名（SISCOMEX/PIX/NF-e/CNPJ/strata）を入れない | ✅ 一切なし。「現場へ降りていく予感」まで |

## 良い点
- ダーク宇宙が読める（惑星シルエット＋dotted sphere＋atmosphere）。restrained premium。
- 2 色規律を球面全体で維持（dot は cool-gray、Crimson は São Paulo の pin-point だけ）。
- 決定論的にスクショ可能（`?p=` で進行度固定）。reduced-motion で copy reveal 無効・idle drift なし。
- Tokyo→São Paulo の自転は地理的に正しい（ほぼ対蹠なので同時に 1 点しか前面に来ない＝降下で受け渡す設計）。

## 弱い点 / 本番への申し送り
1. **globe は手書き procedural dots（均一球・実大陸なし）**。本番は **cobe（land mask）or three-globe ＋ São Paulo は Black Marble luminance を近黒→Crimson に単色 re-map**（design/research の方針）。今回は「prototype は simplified city-light cluster で可」の許可どおり簡易版。
2. **Av. Paulista hairline / city cluster はスクショ尺度で非常に淡い**。本番は僅かに presence を上げてよい（それでも restrained）。
3. **Tokyo は降下状態では裏面**（対蹠ゆえ）。opening（p=0）では Tokyo 側が前面・globe が満ちる。2 点を同時に見せたい場合は corridor section（裏を回る弧）で回収する。
4. **性能**: desktop は 2600 dots/frame で軽い。mobile も可だが、本番 WebGL（cobe）の方が軽量・高品質。DPR clamp(≤2) 済、reduced-motion 静止フレーム化を本番で必須。

## 判定（procedural 版）
Hero の狙い「ブラジルの現場へ降りていく予感」は満たした。infra 説明はしていない（配分 OK）。本番実装は docs/12 ＋ design/research の確定スタックで Codex へ。

---

# v2 — cobe ベース版（本番候補）

`index-cobe.html`（＋ `cobe.js` / `cobe-global.js` 同梱）。cobe 2.0.1 を IIFE で global 化（file:// は ESM import が CORS で不可なため classic `<script src>` で読む）。overlay（São Paulo glow / city cluster / Av. Paulista hairline / 座標）は **cobe の投影式 `U()`/`O()` を実ソースから抽出して再現**し、cobe の marker にピクセル一致で重ねた。São Paulo presence は procedural 比 **+20%**。
スクショ: `cobe-desktop-p00.png` / `-p45.png` / `-p86.png` / `cobe-mobile-p86.png`。

## 判定したかった 3 点
1. **cobe の地球は Andes の格に耐えるか → ◎ 耐える。** 実大陸が dotted で描かれ、闇に沈む premium な質感。procedural の均一球より明確に「serious / infra-grade」。投資家 Hero の主役に足る。
2. **São Paulo が灯る瞬間は弱すぎないか → ○ 十分読める（やや強化余地）。** p=0.86 で Crimson glow がブラジル上に正しく点灯＋座標。restrained は保てている。**本番では「前面を横切る一瞬だけ bloom を足す」と "灯る瞬間" がもう一段効く**（今は連続的で穏やか）。
3. **宇宙だけで終わらず Brazil へ降りる予感を持つか → ◎ 持つ。** Tokyo/アジア前面 → 回転して南米前面 → São Paulo 点灯＋`SÃO PAULO · AV. PAULISTA` の地名/座標、で「現場へ降りる」物語が成立。

## 配分の遵守
✅ Hero に入れたもの: Tokyo/São Paulo 2 marker・São Paulo 増光・座標・Av. Paulista hairline・city cluster。
✅ 入れなかったもの: SISCOMEX / PIX / NF-e / CNPJ / compliance strata / infra 名の大量表示 — 一切なし。色も増やしていない（近黒＋白系 dot＋Crimson のみ）。

## 本番への申し送り（差分）
- **globe は cobe で決まり**（procedural は破棄可）。São Paルo の都市光は本番で Black Marble luminance → Crimson 単色 re-map に置換すると更に良い（今は cobe の land dot ＋ overlay glow で代用、prototype として十分）。
- **cobe 2.0.1 は `onRender` 廃止 → `update({phi,theta,markers})` を自前 rAF で駆動**。marker は per-frame 更新可（per-marker color/size 対応）。arcs API もあり（corridor section で流用可）。
- 投影再現は `U([lat,lng])`＋`O()`（scale=1/offset=[0,0]/ee=0.8/markerElevation=0.05）。Codex 実装でも同式で overlay を載せる。
- reduced-motion: globe を静止フレーム化、overlay は最終状態を静止表示。mobile は DPR clamp(≤2) 済、cobe canvas は 1 枚。
- license: cobe=MIT（同梱可）。

## 総合判定
**cobe を本番 Hero の地球として採用してよい。** 質感・São Paulo 点灯・降下の予感の 3 点すべて合格。残りは「灯る瞬間の bloom 強化」と「Black Marble 都市光」を本番で足すだけ。
