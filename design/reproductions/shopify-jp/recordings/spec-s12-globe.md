# spec — §12 globe 挙動 spec（実装 spec）

> ソース: `storyboard-f2-001/028/055/082.md`（rec2 全 107 frame, 4fps）。
> 実装先: `src/shopify-jp/sections/SpSpeed.tsx` の `GlobeMock` を置換。
> 制約: **hand-rolled canvas 2D + motion/react のみ**（Three.js / cobe / R3F 禁止 — AGENTS.md Stack 固定）。
> 既存資産: `src/shopify-jp/sections/globeDots.ts`（Natural Earth 110m 由来の陸地ドット [lat, lon]、流用する）。

---

## 1. 外観（settled 時点の観測値）

| 要素 | 観測値 |
|---|---|
| 配置 | 中心 x≈25% / y≈52%、直径 ≈80–90vh。左下に大きく bleed（下・左は frame 外） |
| 海 | ほぼ黒の dark navy |
| 陸 | 明るめ teal-green の**粒状 speckle ドット**（dot matrix 質感） |
| 都市光 | **暖色オレンジ〜金の点クラスタ**（日本・韓国・中国沿岸・東南アジア・インド・豪州沿岸・北米・欧州が明瞭） |
| 縁 | デイサイド側に青い rim light |
| 背景 | 漆黒〜深緑グラデ + まばらな星 particle（ゆっくり明滅） |
| 右列 text | 見出し + 本文は globe と独立して**完全固定**（動と静の対比で「安定性」copy を補強） |

---

## 2. 回転

| 状態 | 値 | 根拠 |
|---|---|---|
| idle 自転 | **≈1.5–2°/s の等速**（カムチャツカ輪郭が 0.5s で ~10px 移動 @900px 幅） | f2-001 §3 |
| 方向 | f2-055 = 表面が画面**左→右**（実地球と同じ、北極から見て反時計回り）/ f2-001 = 右→左と記録 → **観測矛盾**。[hypothesis] 実装は f2-055（観測 frame 数が多い）の実地球向きを採用。f2-001 は drag 残慣性の可能性 | f2-001 / f2-055 |
| globe 本体 | 平行移動なし（limb エッジ位置は不動 = 動きは表面の回転のみ） | f2-001 |
| drag | **trackball 操作可**。経度 + 緯度の多軸タンブル（北米→南米→南極→豪州→アジア→欧州→北極とほぼ 1 周可）。ピーク **~100–125°/s** | f2-028 / f2-055 |
| 慣性 | release 後 momentum スピン → ease-out で **~1.5–2s かけて idle 自転速度へ復帰** | f2-055 f069–f072 |
| affordance | custom cursor = **ピンク open-hand（白縁）** を globe 上で常時表示（text 上 I-beam / 通常 arrow の 3 態） | f2-001 / f2-028 |

---

## 3. 弧（arc）

| 項目 | 値 |
|---|---|
| 描画方式 | **彗星型**: 輝点 head（最も明るい）+ 減衰 tail。発射直後は破線 / 粒子の鎖として立ち上がり、頂点を越えて**尾側から減衰して消える**（grow → fade-tail）。全長を一度に描き切らない |
| 色 | 白熱（warm white）〜金、**加算発光**。発着点近傍に金色 glow |
| 軌道 | 都市光 → 別都市へ、大円風 + 球面より高い 3D 放物線（高度バンプ）。画面横断の長弧と短い跳ね弧が混在。稀に大きくループする特徴的軌道（f2-028 f046） |
| 発生 cadence | 新規 **~0.25–0.5s に 1 本**。同時可視 **4–8 本**、演出ピーク時（バースト）は **10 本以上** |
| 寿命 | 1 本 **~0.5–2s** |
| 起点分布 | 都市光の**密集地帯に weighted**（日本・東アジア・豪州沿岸・北米） |
| 稼働条件 | **常時稼働**。section へ scroll 到達した時点で既に弧が飛んでいる（=「再生開始」ではなく常時アニメの canvas を scroll で覗かせる）。drag 高速回転中も生成継続（束状 streak に見える） |
| ★着地演出 | 着地点に**ピンク / マゼンタの小バースト**が点灯 → 一部が**紫・ピンク・緑の花火 particle** に段階成長（放射状に開いて減衰）。tooltip「26秒に1回 初売上」と意味同期したセレブレーション。scroll 退場中も生きたまま |

---

## 4. tooltip（統計カード）

### 様式（共通）

濃色半透明の角丸ピル + 細い teal/緑ボーダー + 左に丸アイコン + **緑のモノスペース字**。数字大 + 説明小の 2 段。fade で出入り。

### 3 種の内容

| # | アイコン | 1 行目（大） | 2 行目（小） | 備考 |
|---|---|---|---|---|
| ① | 緑 storefront | 数百万社 | SHOPIFYを利用するマーチャントの数 | |
| ② | $ コイン | $1,6xx,xxx,xxx,xxx | 販売合計（現在も増加中） | **live counter**。観測値が $1.0T（f2-055）と $1.6T（f2-028）→ 実際に増分する桁 counter |
| ③ | 緑クラッカー | 26秒に1回 | SHOPIFYで起業家が初めての売上を達成している頻度 | 4x 拡大クロップで判読済（f2-082 の「26件に1件」は誤読側） |

### 表示サイクル / アンカー挙動

| 挙動 | 観測 |
|---|---|
| 表示トリガ | **自動表示**（hover 不要。cursor が遠くにある状態で fade-in を確認） |
| アンカー | **world-anchored**: globe 表面の固定点（lat/lon）に係留。回転と一緒に画面内を移動し、アンカーが裏側へ回ると**画面端から退場** |
| サイクル | 1 個ずつ表示、**約 4–8s 間隔でローテーション**（① f030–034 ≈1.5s → ② f035–f052 ≈4s 強 → … ① 再出現 f076）。同時表示は基本 1 個 |
| scroll 連動 | 初出は scroll 進入時に viewport 下端から globe と一緒に入場。退場時も globe に追従したまま scroll-out |

---

## 5. §11 で観察された motion（隣接 section、参考）

| 要素 | 観測 |
|---|---|
| 浮遊サムネ（~10 枚） | **idle アニメ無し**（静止時 diff=0）。scroll 時は本文と**同速**（parallax 無し）。**section を跨いで §12 に被ったまま残る** = section 非依存の装飾レイヤー |
| checkout UI panel | scroll 同速で退場。独立アニメ無し |
| mini PiP 動画カード | 右下 **fixed overlay**（x≈78–95% / y≈78–95%）。全 scroll を通じて常駐 + muted autoplay。scroll の影響を受けない唯一の UI |
| §11→§12 遷移 | **仕掛けゼロの素直な scroll**（fade / scale / scroll-jack 無し）。§12 見出し・本文も scroll とともに下から入るだけで独立 entrance 無し |
| §12→§13 退場 | 通常 scroll。§13 が**角丸コンテナとして下端から進入**。globe の花火・tooltip は退場中も生きたまま |

---

## 6. 実装方針（hand-rolled canvas 2D + motion/react）

### アーキテクチャ

```
SpSpeed.tsx
├─ <GlobeCanvas>        canvas ×1 + rAF ループ（全描画）
│   描画順: 星空 → 球地(radial gradient) → 陸ドット → 都市光 → 弧 → 着地burst/花火 → rim light
├─ <GlobeTooltip> ×1    DOM（motion.div + AnimatePresence で fade）。位置は rAF 内で
│                       ref.style.transform 直更新（React re-render 回避）
└─ 右列 text            既存のまま（完全静置）
```

### 描画レイヤ詳細

| レイヤ | 実装 |
|---|---|
| 投影 | lat/lon → 3D 回転（yaw/pitch）→ **正射影**。z>0（前面半球）のみ描画、z でサイズ・alpha を減衰 |
| 陸ドット | 既存 `GLOBE_DOTS` を mount 時に Float32Array へ事前変換。色 teal-green、r 1.5–2.5px |
| 都市光 | 別配列 ~40–60 都市の lat/lon（東京・大阪・ソウル・上海・香港・シンガポール・ジャカルタ・シドニー・ムンバイ・ロンドン・NY・LA・サンパウロ等）。暖色金 + **pre-render した radial gradient sprite**（`shadowBlur` は使わない — 重い） |
| 弧 | spawn: 0.25–0.5s 毎（乱数）に都市 weighted 抽選で発着ペア生成。経路 = 大円 slerp + 高度 `sin(t)×(0.08–0.18)R`。trail = 直近 N サンプル点の polyline を alpha 減衰で描画（彗星）。`globalCompositeOperation: "lighter"` で加算発光。同時上限 8（reduced 時 0） |
| 着地 burst | 着地時にピンク小 burst（radial particle 6–10 個、~0.4s）。**確率 ~20% で花火へ昇格**（紫/ピンク/緑、放射 20–30 particle、開いて減衰 ~1.2s） |
| rim light | 球輪郭に沿う細い青グラデ stroke（静的、1 回 path） |
| 星空 | 固定座標 ~80 点、sin 波で opacity 明滅（位相ばらし） |

### 回転 / drag 制御

| 項目 | 実装 |
|---|---|
| 状態 | `{ yaw, pitch, vYaw, vPitch }` を ref で保持（state にしない） |
| idle | `vYaw = 1.75°/s`（表面 左→右）へ常時 lerp 復帰 |
| drag | canvas に pointerdown/move/up。移動量 → 速度を直近数 frame で平滑化。pitch は ±85° クランプ |
| 慣性 | release 後 `v *= 0.95/frame` の指数減衰 → idle 速度へ ~1.5–2s で収束 |
| cursor | globe 円内 hover で `cursor: grab` / drag 中 `grabbing`（本家のピンク手 custom cursor はサイト共通 cursor 実装側の課題、ここでは標準 grab で代替可） |

### tooltip 制御

| 項目 | 実装 |
|---|---|
| ローテーション | ①→②→③ を 5–6s 周期で巡回（表示 ~3s + 休止）。`useStageTimeline` 系 or setTimeout chain |
| アンカー | 各 tooltip に lat/lon を持たせ、rAF 内で投影 → DOM transform 直更新。**z<0.1 になったら強制 fade-out**（裏側へ回った） |
| counter（②） | rAF 内で `value += rate×dt` し 1,000 区切り整形。reduced 時は固定値 |
| 出入り | motion/react の opacity fade（0.3s）。hover 不要の自動表示 |

### パフォーマンス / a11y

| 項目 | 実装 |
|---|---|
| 停止条件 | IntersectionObserver で off-screen 時 rAF 停止（**ただし「常時稼働に見える」ことが要件** — 再開時に時間を進めた状態から描く。in-view 進入の瞬間に弧が既に飛んでいること） |
| dpr | `min(devicePixelRatio, 2)` cap |
| reduced-motion | 静止 1 frame（自転なし）+ 弧 3–4 本を固定 opacity で静的描画 + drag 無効 + counter 固定。`role="img"` + 既存 `GLOBE_ARIA` 維持 |
| 禁止事項 | Three.js / cobe / WebGL 自前実装は不要（2D 正射影で成立）。`console.log` 残し禁止 |

### 実装の段階分け（Codex 向け）

| step | 内容 | PASS 条件 |
|---|---|---|
| 1 | canvas 投影 + 陸ドット + idle 自転（1.75°/s, 左→右） | GLOBE_DOTS が球として回る |
| 2 | 都市光 sprite + 星空 + rim light | 観測の配色（navy 海 / teal 陸 / 金都市光）に一致 |
| 3 | 弧 spawn + 彗星 trail + 加算発光 | 同時 4–8 本、寿命 0.5–2s、常時稼働 |
| 4 | drag + 慣性 + grab cursor | 投げ → momentum → idle 復帰が滑らか |
| 5 | 着地 burst / 花火 + tooltip ×3（world-anchored + counter） | tooltip が回転に追従し裏側で退場 |
| 6 | reduced-motion / off-screen 停止 / lint+typecheck+build 緑 | 全 mandatory チェック通過 |
