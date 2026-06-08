---
title: 09 アニメーション素材インデックス
updated: 2026-06-02
status: living（随時追記）
owner: Claude（設計）/ 実装は Codex
---

# 09 アニメーション素材インデックス

> Andes コーポレートサイト用のアニメーション素材を **いつでも引き出せる索引**。
> 全候補は agent が GitHub API / npm registry を fetch して license・メンテ状況・互換を**実測検証済**（2026-06-02）。
> 判断軸: Anthropic 声＝落ち着き / Crimson #C8102E は pin-point / 純抽象 / 追加依存・`'use client'` 最小 / `prefers-reduced-motion` 前提（docs/04・docs/07 準拠）。

## 判定の凡例

| 記号 | 意味 |
|---|---|
| ✅ | 確定採用（既導入が多い、追加コスト最小） |
| ➕ | 新規追加 推奨 |
| ⚖ | 条件付き（方向性しだい・`[sir-decide]`） |
| △ | 保留・限定用途で候補 |
| ✕ | 見送り（理由あり） |
| ⛔ | 採用不可（ライセンス NG 等） |

## 既導入パッケージ（package.json 実測 2026-06-02）

`gsap@3.15` / `@gsap/react@2.1` / `lenis@1.3` / `@react-three/drei@10.7` / `@react-three/fiber@9.6` / `three@0.184` / `framer-motion@12.40` / `split-type@0.3` / `remotion@4.0` / `@remotion/player@4.0`

→ **本命スタックはほぼ全部 既導入で賄える。新規は `@number-flow/react` 1 つだけ。**

## 実体 DL 済（Codex 引き出し用）

コピペ系コンポーネントは実体を `design/animation-kit/` に DL 済（MIT・Magic UI）:
- `design/animation-kit/components/animated-beam.tsx`（agent 抽象図・本命）
- `design/animation-kit/components/number-ticker.tsx`（数字・代替案）
- `design/animation-kit/components/particles.tsx`（粒子・任意）
- `design/animation-kit/README.md` ← **コピー手順 + 適合（cx / framer-motion へ 2 置換）+ install 表**

> 適合: 本プロジェクトは `cx`(@/lib/classnames) と `framer-motion` 使用。Magic UI の `cn`/`motion/react` を 2 置換すれば**新規 npm 依存ゼロ**で動く（詳細は kit の README）。

### Codex のアニメ品質を底上げする skill（任意・推奨）

GSAP 公式の **`gsap-skills`**（AI に GSAP を正しく書かせる教科書・MIT・★7,338）を Codex に入れると「PPT っぽいアニメ」を改善できる。必要 4 冊（scrolltrigger/timeline/react/performance）に絞って導入。詳細・導入コマンド・誇張ツイートの訂正は **docs/10 の「7. AI Skills（導入候補）」** 参照。未導入（sir 確認待ち）。

---

## ★ 確定スタック（クイック参照）

| 用途 | 採用 | 状態 |
|---|---|---|
| Hero 見出し（行が立ち上がる演出） | GSAP SplitText（行マスク＋控えめ文字ずらし） | 既導入 |
| スクロール（なめらか＋固定／追従） | Lenis + GSAP ScrollTrigger + @gsap/react | 既導入 |
| **Hero 背景（カーソル追従の流体）** | **three-fluid-fx** | **第一候補・要試作**（sir-decided 2026-06-02） |
| Hero 背景 フォールバック | drei `GradientTexture` + `MeshDistortMaterial` | 既導入（試作 NG 時に採用） |
| 軽い動き・線の描画 | framer-motion（`motion.path` / `whileInView`） | 既導入 |
| agent 抽象図（光点が線を流れる） | Magic UI Animated Beam | コピペ（依存=既導入） |
| 4 マクロ数字（桁が回る） | @number-flow/react | **新規 1 つ** |

---

## ① Hero 文字

| 名前 | URL | ライセンス | メンテ | 用途 | 判定 |
|---|---|---|---|---|---|
| GSAP SplitText | https://gsap.com/docs/v3/Plugins/SplitText/ | GSAP 商用無償 | active | 見出し分割→行マスク／文字ずらし出現 | ✅ |
| framer-motion (Motion) | https://github.com/motiondivision/motion | MIT | active | 宣言的な文字ずらし出現 | ✅(既導入) |
| split-type | https://github.com/lukePeavey/SplitType | ISC | stale(2023) | 文字/行 分割のみ（動きは別） | △(補助・既導入) |
| Magic UI Text Animations | https://magicui.design/docs/components/text-animate | MIT | active | コピペの各種出現演出 | △(参考) |
| React Bits Text | https://reactbits.dev/text-animations/split-text | MIT+Commons Clause | active | 文字演出の見本帳 | △(参考) |
| troika-three-text | https://github.com/protectwise/troika | MIT | active | 3D 立体文字（上級） | △(保留) |
| use-scramble | https://use-scramble.dvln.io | MIT | active | 文字スクランブル | ✕(派手・重厚 hero に不一致) |
| Blotter.js | https://github.com/bradley/Blotter | 不明 | 放置(2020) | 液状文字 | ⛔(license 不明・React 非対応) |
| Motion+ splitText | https://motion.dev/docs/split-text | 有料 | active | 分割ヘルパ | ⛔(有料・split-type で代替) |

**採用理由（GSAP SplitText）**: 行が下から立ち上がる行マスクが、宣言型 hero「経済の基盤を建てる」の重厚さに最適。de-facto・既導入・スクランブル系より静かで Anthropic 声に合う。

## ② スクロール駆動

| 名前 | URL | ライセンス | メンテ | 用途 | 判定 |
|---|---|---|---|---|---|
| Lenis | https://lenis.darkroom.engineering | MIT | active | なめらかスクロール本体 | ✅(既導入) |
| GSAP ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | GSAP 商用無償 | active | 固定／追従／視差／順次立ち上げ | ✅(既導入) |
| @gsap/react (useGSAP) | https://github.com/greensock/react | GSAP 商用無償 | active | React で GSAP を安全に書く | ✅(既導入) |
| framer-motion useScroll | https://motion.dev/docs/react-scroll-animations | MIT | active | 軽量なスクロール連動 | ✅(既導入) |
| drei ScrollControls | https://drei.docs.pmnd.rs/controls/scroll-controls | MIT | active | 3D をスクロール連動 | △(3D を絡める section 限定) |
| react-scroll-motion | https://github.com/1000ship/react-scroll-motion | MIT | 低活発 | 既製の固定シーン部品 | △(候補) |
| react-scroll-parallax | https://react-scroll-parallax.damnthat.tv | MIT | active | 視差特化 | ✕(GSAP と重複) |
| locomotive-scroll v5 | https://github.com/locomotivemtl/locomotive-scroll | MIT | active(beta) | Lenis 上の rewrite | ✕(Lenis 直で代替) |

**de-facto 確定**: Lenis + GSAP ScrollTrigger + @gsap/react（3つとも既導入）。Stripe/Sierra の「section が順に立ち上がる」表現はこの組合せ。

## ③ WebGL 背景 / 流動

| 名前 | URL | ライセンス | メンテ | 用途 | 判定 |
|---|---|---|---|---|---|
| drei GradientTexture | https://drei.docs.pmnd.rs/abstractions/gradient-texture | MIT | active | 低速で色が流れるグラデ面 | ✅(既導入) |
| drei MeshDistortMaterial | https://github.com/pmndrs/drei | MIT | active | メッシュがゆっくり波打つ流動 | ✅(既導入) |
| drei shaderMaterial | https://github.com/pmndrs/drei | MIT | active | 自前 GLSL を material 化 | ✅(既導入) |
| ShaderGradient | https://www.shadergradient.co | MIT | active | Stripe 風の動くグラデ（リッチ） | △(盛りたい時のみ) |
| **three-fluid-fx** | https://github.com/artcodev/three-fluid-fx | MIT | 新しい(v0.1) | カーソル追従の流体／インク／煙 | ✅**第一候補・要試作**（sir-decided） |
| react-fluid-distortion | https://github.com/whatisjery/react-fluid-distortion | MIT | active | 既存背景に重ねる流体歪み | △(試作の代替案・postprocessing 追加要) |
| three-custom-shader-material | https://github.com/FarazzShaikh/THREE-CustomShaderMaterial | MIT | active | GLSL 拡張の土台 | △(自作時) |
| WebGL-Fluid-Simulation | https://paveldogreat.github.io/WebGL-Fluid-Simulation/ | MIT | 低活動 | 定番の高品質流体 | △(生 WebGL・重い・統合自前) |
| whatamesh | https://github.com/jordienr/whatamesh | **LICENSE 無し** | 放置 | Stripe mesh 流動 | ⛔ |
| paper.design / shaders | https://paper.design | **PolyForm noncompete** | active | MeshGradient 流動（最も綺麗） | ⛔ |
| LYGIA | https://lygia.xyz | **Prosperity（商用 30 日のみ）** | active | GLSL 関数ライブラリ | ⛔ |

**流動の方向 = カーソルで流体（three-fluid-fx）に決定（sir-decided 2026-06-02）**。ただし「作ってみないと分からない」ので **試作 → 動作・質感 OK なら本採用 / NG なら drei grad×distort にフォールバック**。試作仕様は下記「Hero 流体 試作仕様」。
**フォールバック（drei grad×distort）**: MIT・既導入・最軽量。試作 NG 時はこれで「静かに流れる面」を作る。Crimson pin-point の色規律を壊さない安全策。

## ④ 抽象図・数字

| 名前 | URL | ライセンス | メンテ | 用途 | 判定 |
|---|---|---|---|---|---|
| @number-flow/react | https://number-flow.barvian.me | MIT | active | 桁が回る数字（Intl 桁区切り内蔵） | ➕(新規推奨) |
| Magic UI Animated Beam | https://magicui.design/docs/components/animated-beam | MIT | active | ノード間を光点が流れる＝データの流れ | ✅(コピペ・依存=既導入) |
| framer-motion motion.path | https://github.com/motiondivision/motion | MIT | active | 線の描画／経路を点が流れる | ✅(既導入) |
| Magic UI Number Ticker | https://magicui.design/docs/components/number-ticker | MIT | active | バネ補間の数字増加 | △(number-flow の代替) |
| Magic UI Particles | https://magicui.design/docs/components/particles | MIT | active | カーソル反応の粒子背景 | △(任意) |
| GSAP DrawSVG | https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/ | GSAP 商用無償 | active | SVG 線の描画 | △(凝った段階描画が要る時・既導入) |
| React Flow (@xyflow) | https://reactflow.dev | MIT | active | 本格ノード図 | ✕(技術図的・純抽象方針に反する) |
| react-force-graph | https://github.com/vasturiano/react-force-graph | MIT | active | network が立ち上がる | ✕(ごちゃつき) |
| tsparticles | https://particles.js.org | MIT | active | 粒子＋線の network | ✕(ごちゃつき) |
| react-countup | https://github.com/glennreyes/react-countup | MIT | 停滞 | 数字カウント | ✕(number-flow 優先) |
| vivus | https://github.com/maxwellito/vivus | MIT | 停滞 | SVG 線の描画 | ✕(React 統合自前) |

**採用理由（Animated Beam）**: 「データの流れ」を最も純抽象に表現でき、reactflow のような技術図ノイズが出ない。コピペ取り込み・依存は motion（既導入）のみ。
**採用理由（@number-flow/react）**: MIT・React19 明示・Intl 桁区切り内蔵で `US$7,690億` を宣言的に処理。framer-motion 自作より品質高く実装速い。小さな `'use client'` に隔離可。

---

## ⛔ 採用不可リスト（見た目が良くても使わない）

| 名前 | NG 理由 |
|---|---|
| paper.design / shaders | PolyForm Shield（noncompete、OSS でない） |
| LYGIA | Prosperity（商用は 30 日 trial のみ無料） |
| whatamesh | LICENSE ファイル無し（Stripe 由来 reverse-eng） |
| Blotter.js | LICENSE 不明・2020 放置・React 非対応 |
| Motion+ 内蔵 splitText | 有料（split-type で無償代替） |
| react-countup / locomotive v5 / react-scroll-parallax | 機能重複 or 更新停滞（既導入で代替可） |

## ライセンス注記（GSAP）

GSAP（ScrollTrigger / SplitText / DrawSVG 含む）は MIT ではなく独自 "No Charge License"。**ただし既に package.json に採択済**で、コーポレートサイト用途は完全に許諾範囲（Webflow 競合のノーコードツールを作らない限り全プラグイン無償）。**追加の sir 判断は不要。**

## Hero 流体 試作仕様（Codex 向け）

> sir 決定: hero 背景は **カーソル追従の流体（three-fluid-fx）を第一候補**。実機で作って質感・動作を確かめてから本採用を確定する（`[verified]` 待ち）。

**試作タスク**
1. `three-fluid-fx`（MIT）を導入し、hero 背景に全画面で載せる試作ブランチ（`feat/hero-fluid-proto`）
2. 既導入の `@react-three/fiber@9.6` / `three@0.184` と peer 整合を確認（three-fluid-fx は three>=0.183 要求）
3. `'use client'` の独立 component に隔離（Server Component 既定を崩さない）
4. 色は流体の base を低彩度に寄せ、**Crimson #C8102E は pin-point**（流体全体を赤くしない）

**合否基準（これを満たせば本採用 = `[verified]`、未達なら drei フォールバック）**
- [ ] desktop で 60fps 近辺、質感が「上質」（チープな絵の具にならない）
- [ ] mobile / 非力 GPU で内蔵 quality profile を当て、体感が破綻しない（FPS 実測）
- [ ] `prefers-reduced-motion: reduce` で流体を止め、静止画 or drei グラデにフォールバック
- [ ] hero 見出し（GSAP SplitText）の可読性を妨げない（コントラスト確保）
- [ ] 色規律 OK（Crimson が pin-point に留まる）

**NG 時のフォールバック**: drei `GradientTexture` + `MeshDistortMaterial`（既導入・「静かに流れる面」）。

→ 試作後、結果をこの doc の判定に反映（✅`[verified]` 本採用 / ✕→フォールバックへ）。

## 出典

- リサーチ実施 2026-06-02（4 領域並列、GitHub/npm を fetch 実測）
- 関連: docs/04（色 lock）/ docs/07（homepage spec）/ memory `reference_animation-stack`
