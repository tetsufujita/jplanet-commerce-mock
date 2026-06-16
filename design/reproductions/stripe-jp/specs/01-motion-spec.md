# 01 — stripe.com/jp Motion Spec（storyboard 合成版）

> 入力: storyboard-scroll-{001,028,054}.md / storyboard-hover-{001,030,059,088,117,146,174}.md / specs/00-section-map.md / hover-inventory.json
> 計測条件: 3fps フレーム抽出（1 frame = 333ms）のため、duration は下限保証なしの推定値。§3 の「要・精密測定」を必ず実測してから実装确定すること。
> section 番号は `00-section-map.md` に準拠（§0 Header 〜 §9 Footer）。
> 作成: 2026-06-11 / 合成担当 Claude

---

## 0. 全体設計思想（全 storyboard 一致の結論）

1. **entrance アニメは「ほぼ無い」**。全 section は viewport 進入時に opacity 1・最終位置で観測（scroll 3 本とも一致）。あっても ≤333ms の極短 fade。**「派手な fade-up stagger」を入れると Stripe らしさから離れる**。
2. **動きの主役は常時再生のアンビエントメディア**：marquee / live counter / デモ auto-rotation / inline video / canvas wave。hover とは完全に独立して回る。
3. **hover feedback は局所・短時間・対称**：arrow shift、ボタン色、expand icon fill のみ。カード本体の lift / shadow / scale は録画では一切観測されず（ただし DOM に shift/grow 変数あり → 要実測）。
4. duration の相場感：**hover 系 150–300ms / megamenu open 400–500ms / panel 切替 250–500ms / デモ crossfade 300–700ms（stagger 込み全体 1.0–1.7s）**。

---

## 1. Section 別 motion spec

| § | section | 出現アニメ（scroll 進入時） | アンビエント / 内蔵モーション | duration / easing | 備考 |
|---|---|---|---|---|---|
| 0 | Header | page-load で即表示。**sticky でない**（下スクロールでコンテンツと共に退出。上スクロール時の再出現は未確認→要実測） | — | — | hero gradient 上では透過 header（白文字）、megamenu open で白 solid に反転（§2 interaction 表参照） |
| 1 | Hero | **長い entrance なし**（白画面→1 frame で完全表示、<333ms。stagger 未検出） | ① GDP ticker：見出しより遅れて数値 type-in（約 0.7–1.0s）→ 以降 odometer 永続 tick（約 1–1.7s ごとに末尾桁 +1、桁は縦 slide-up roll ~300ms）② logo marquee：左方向 linear 無限 loop、実測 ≈25–40px/s @1440px。megamenu open 中・scroll 中も停止しない ③ 背景 wave：色帯が極低速で morph（※DOM は静的 picture → 矛盾、要実測 P1） | marquee = linear / easing なし。ticker roll = ~300ms 縦 slide | DOM: h1 二枚重ね（gradient clip）、ticker は桁別 span の outgoing/incoming スロット式、marquee は JS の inline translateX |
| 2 | プロダクト bento（6 カード） | 見出し・カードとも entrance 未検出（即表示）。`lazy-animation--loaded` が viewport 進入で付与される仕組みのみ | ① token counter：odometer（ランダム目標値へ桁 roll ~1s ease-out、数秒間隔で更新。単調増加でない）② 棒グラフ：counter 更新に同期して各バー 300–500ms ease-out で伸縮 ③ locale デモ auto-rotation（JP⇄US⇄DE）：phone → browser checkout → サマリーの順に **stagger crossfade**（各 300–600ms、間隔 ~300ms、全体 1.0–1.7s、ease-out）。時間駆動（hover 非依存）と推定 ④ agentic カード：chat 吹き出し fade-in（300–600ms ease-out、scroll-into-view トリガー）+ 粒子 swarm 常時 drift ⑤ crypto カード：viewport 進入時に送金弧 + 金額 badge が pop（300–600ms ease-out）、地球儀粒子は常時 loop ⑥ issuing カード：カード柄 crossfade サイクル（紫 VISA⇄白、各 ~333–666ms、周期 ~2.6s+）⑦ 大型カード下辺の gradient border glow が極低速 linear infinite で這う ⑧ 使用量バー：linear で数秒かけ漸増 | デモ crossfade = 位置移動なしの opacity crossfade | hover は expand icon ⤢ のみ変化（§2 表）。カードは `aria-haspopup="dialog"` = クリックで dialog |
| 3 | 日本語サポート帯 | entrance なし（進入時完成形） | 背景 = loop 動画/動的グラデ（模様が常時微変化）。chat banner は inline clip-path + translateY + opacity で吹き出し入替り | — | DOM: picture ×2 + dom-graphic |
| 4 | stats（135+ / $1.9兆 / 99.999% / 2億+） | 数値出現は 1 frame 以内に完了 or 無し（count-up 未検出 → 要実測 P7） | ① 時間帯テーマ：`--gradient--{sunrise,daytime,dusk…}` の背景クロスフェード（combobox 切替）② stats-menu：`--active-stat-index` / `--hover-indicator-index` の indicator 移動 ③ 直下の暖色パーティクルバースト：常時動作（scroll-scrub か autoplay か未判別 → 要実測 P8） | — | active stat の下にグラデ下線 |
| 5a | 大企業・導入事例 | entrance なし | Hertz カード = inline 動画 autoplay muted loop（交差点を車が走行）。アコーディオン 3 行は閉状態で静的（stagger なし） | — | `customer-story-button` は inline width + text/icon opacity 入替（開閉アニメ → 要実測 P22） |
| 5b | スタートアップ carousel | entrance なし（タイル stagger 未検出） | Runway タイル = 水面 inline 動画 loop。carousel 矢印は disabled 状態スタイル（先頭で ← グレー / → 青） | — | DOM: drag carousel（`--carousel-scroll-progress` / `--carousel-drag-offset` / **hover scale 1.036**） |
| 5c | SaaS プラットフォーム | **Zenflow ダッシュボード widget の段階 build-in**：進入時は空 → カード枠グリッドが順次 fade-in（各 ~300–600ms、stagger 推定） | testimonial carousel：active ロゴ（mindbody 等）下の **progress 下線が linear で伸びる auto-rotate**（周期数秒 → 要実測 P11） | widget fade-in ease 不明 | 本 page で数少ない「UI 自体が動く」演出 ×2 |
| 6 | 開発者（dark） | 白→濃紺のハードな section 境界（transition なし）。構成図は進入時完成形（draw-in 未検出 → 要実測 P9） | ① 構成図：SVG 破線 path（stroke #5D64FE, stroke-dasharray）= dash flow の可能性 + app logo flip（front/back ×7）② 紫 wave：常時動作の canvas/動画、scroll 進入で全面に拡大 ③ code editor カード：typing/実行アニメの有無未確定（→ 要実測 P10） | — | 5億+/1万+/15万+ の count-up も未検出 |
| 7 | Stripe の最前線 carousel | entrance なし | auto-advance は録画区間内で未発生（→ 要実測 P20）。実体は `canvas.squeezy-carousel__canvas`（1232×460、本 DOM 唯一の大型 canvas） | — | ← → pagination + mobile fallback card ×8 |
| 7b | 今週注目の本 | entrance なし | なし（静的） | — | — |
| 8 | Footer CTA | entrance なし | なし | — | CTA は hover arrow 共通仕様（§2 表） |
| 9 | Footer | なし（完全静的） | なし | — | — |

---

## 2. Interaction 別 motion spec

### 2a. Megamenu（nav 5 項目：サービス / ソリューション / 開発者 / リソース = megamenu、料金体系 = 直リンク）

| 対象 | trigger | 変化内容 | duration / easing | 戻りアニメ |
|---|---|---|---|---|
| megamenu open | nav trigger hover | panel が**上端 anchor で下方向に clip/height 展開**（内容は top 揃え clip、scale 変形なし＝文字は歪まない）。`navigation-menu__background` の白パネルが変形本体。panel 内容は hover 時に React mount（DOM 静置でない） | **400–500ms / ease-out**（実測幅 350–650ms） | close = fade-out + collapse、**≤333ms（体感 150–250ms）**。panel unmount |
| header テーマ反転 | open と同時 | 透過 header（白文字・白枠サインイン）→ 白 solid（黒文字・紫サインイン pill）。「営業にお問い合わせ」紫 pill は不変 | open と同 duration、fade | close と同時に透過へ復帰 |
| nav chevron | open / 切替 | ∨ → ∧ rotate 180° | ~200–300ms、open と同期 | 切替・close で対称に復帰 |
| 背後 veil | open と同時 | ページ全体に白 veil fade-in（最終 opacity 80–90% 見当 → 要実測 P3）。veil 越しに marquee は動き続ける | 300–500ms fade | close で fade-out |
| panel 切替（隣 trigger へ hover 移動） | 開いたまま隣 trigger hover | **panel は閉じない**。コンテンツ crossfade + コンテナ width/height morph（サービス 5 列・高 → ソリューション 4 列・高さ約 2/3 等、panel サイズが trigger ごとに補間）。crossfade か横 slide かは 3fps で判別不能 | **agent 間で 200–300ms と 350–500ms に割れ → 要実測 P2**。ease-in-out | — |
| nav siblings 退色 | nav 内のいずれかを hover（**megamenu 無しの料金体系 hover でも発生**） | 非 hover の nav 項目が約 40% に fade 退色（実測輝度 109–128 vs 通常 31–52） | ≤333ms | マウスが nav を離れると一斉に通常コントラストへ fade-in（≤333ms） |

### 2b. ボタン / リンク

| 対象 | trigger | 変化内容 | duration / easing | 戻りアニメ |
|---|---|---|---|---|
| primary CTA「始める」「営業にお問い合わせ」等（`hds-button--primary` + `hds-icon-hover-arrow`） | hover | ① **arrow shift**：chevron「›」に軸線が fade-in して「→」化 + 約 1px 右シフト（Stripe シグネチャー）② 背景 darken：RGB(99,78,250) → RGB(83,68,203) | arrow ~150–300ms ease-out / bg ~200–300ms（同一 transition の可能性あり → P24） | 1 frame 内で対称復帰（軸線が引っ込む）。≤333ms |
| 「Google で登録」secondary | hover | **border-color のみ** gray RGB(237,237,237) → 薄紫 RGB(202,196,234)。背景・文字・サイズ不変 | ≤333ms | 同上 |
| 「サインイン」白 pill（header） | hover | border 濃化 + 文字濃化（輝度 100→72）。形状変化・lift なし | ≤333ms | **戻りは ON より遅い** 400–600ms のゆるい fade（余韻） |
| テキストリンク「事例を表示 ›」等（`hds-link`） | hover | arrow shift 同型と推定（録画では解像度不足で未検出） | — | — |

### 2c. カード

| 対象 | trigger | 変化内容 | duration / easing | 戻りアニメ |
|---|---|---|---|---|
| bento カード expand ボタン ⤢ | hover（カード全域か ⤢ 直上かは未判別 → P13） | resting = 薄ラベンダー bg（#EEEDFF 系）+ 紫グリフ → hover = **#635BFF 塗りつぶし + 白グリフ**。グリフ→bg の順に別タイミング遷移の疑いあり | 150–300ms 単純 color fade（linear 相当） | 対称・同速（遅延なし） |
| bento カード本体 | hover | **録画では lift / shadow / scale / border 変化ゼロ**。ただし DOM に `data-bento-card-hover-class` + `--card-shift-x/y` `--card-grow-x/y`（マウス方向に shift/grow）が存在 → 矛盾、要実測 P12 | — | — |
| bento カード click | click | dialog 展開（`aria-haspopup="dialog"`、snapshot 未 mount） | 未計測 | — |
| 5b carousel カード | hover | `--carousel-hover-scale-target: 1.036`（DOM より。録画区間では未観測） | 要実測 P25 | — |
| 5a 事例アコーディオン「+」 | click | 行展開（録画では未操作） | 未計測 | — |

---

## 3. 要・精密測定リスト（Playwright getComputedStyle / DevTools Animations 実測）

> 333ms 粒度のフレーム分析では確定できなかったもの。**P1–P5 は実装ブロッカー級**、以降は磨き込み用。

| # | 対象 | 確認すべきこと | 由来 |
|---|---|---|---|
| P1 | **hero 背景 wave** | storyboard 3 本は「gradient が常時 morph」と観測、DOM snapshot は「`hero-wave-animation__static` の静的 picture のみ・canvas 無し」→ **矛盾**。runtime 注入の animated 版有無、morph の実装（video / CSS / canvas）と周期 | scroll-001 #5 vs 00-section-map §2 |
| P2 | **megamenu panel 切替** | duration が agent 間不一致（hover-001: 200–300ms / hover-030: 350–500ms）。crossfade か横 slide か。コンテナ morph の transition プロパティと easing | hover-001 #7 / hover-030 #2 |
| P3 | megamenu open/close | 実装方式（clip-path / height / scaleY+counter-scale）、正確な duration・easing、veil の最終 opacity と背景色 | hover-001 #3#6 |
| P4 | header 挙動 | sticky 有無（上スクロール時に再出現するか）、megamenu open 中に scroll した場合の挙動 | scroll-001 #6 / scroll-054 #1 |
| P5 | bento カード hover | `--card-shift-x/y` `--card-grow-x/y` の実値と transition（録画では検出ゼロだが DOM に存在）。⤢ 点灯がカード全域 hover かボタン直上か。グリフ/bg の transition 分離 | hover-117 / hover-174 / 00-map §5 |
| P6 | hero page-load | <333ms 内の stagger 内訳（fade のみか、要素別 delay があるか） | scroll-001 不確実 1 |
| P7 | stats counter | 135+ / $1.9兆 / 99.999% / 2億+ と 5億+ / 1万+ / 15万+ の count-up 有無（低速 scroll で再観測 or JS 実装確認） | scroll-028 #3#20 |
| P8 | パーティクルバースト（§4 直下） | scroll-scrub（逆 scroll で巻き戻るか）か autoplay 動画か | scroll-028 #4 |
| P9 | 開発者構成図（§6a） | stroke-dasharray の dash flow アニメ有無、app logo flip（front/back）の周期・トリガー、ノード stagger | scroll-028 #19 / 00-map §5 |
| P10 | code editor カード（§6c） | typing アニメ・terminal 逐次出力の有無 | scroll-028 #21 |
| P11 | testimonial carousel（5c） | ロゴ下線 progress の周期（auto-rotate 間隔）、クリック切替時のアニメ | scroll-028 #17 |
| P12 | GDP ticker | tick 間隔（観測 1–1.7s）、桁 roll の duration / easing、初回 type-in の正確な演出 | scroll-001 #2#3 / hover-030 ambient |
| P13 | token odometer（§2 billing カード） | roll duration、更新間隔、目標値生成ロジック（ランダム揺れ） | hover-146 #4 / hover-174 #2 |
| P14 | logo marquee | 正確な px/s（推定幅 16–60px/s に散らばる。JS inline translateX 駆動なので rAF 値を実測） | 全 storyboard |
| P15 | locale デモ rotation（§2） | 周期、トリガー（純時間駆動か scroll/hover 誘発か）、stagger の正確な間隔とパネル順序 | hover-059 #17#18 / hover-088 #12 / hover-174 #5 |
| P16 | gradient border glow（§2 大型カード） | 実装（linear-gradient position / conic 回転）と周期 | hover-088 #4 |
| P17 | issuing カード柄サイクル | crossfade duration と周期（観測 ~2.6s+ 保持） | hover-174 #7#8 |
| P18 | Zenflow widget build-in（5c） | stagger 間隔・各 widget の duration・トリガー閾値 | scroll-028 #14 |
| P19 | §3 chat banner | clip-path / translateY 入替の周期と easing | 00-map §5 |
| P20 | squeezy carousel（§7） | auto-advance 有無・canvas 内の遷移アニメ・矢印 disabled 切替 | scroll-054 #2 / 00-map §4 |
| P21 | §6 手前 dark navy anchor bar | sticky pin → release か単なる通過か | scroll-054 #1 |
| P22 | customer-story-button（5a） | inline width 変化のアニメ（開閉時の width transition + text/icon opacity 入替） | 00-map §5 |
| P23 | section entrance 全般 | ≤333ms の極短 fade が本当に「無い」のか（`lazy-animation--loaded` 付与時の CSS を確認） | scroll 3 本共通 |
| P24 | 「始める」hover | arrow と bg darken が同一 transition か、arrow 先行の stagger か | hover-059 不確実 5 |
| P25 | 5b carousel hover scale | `--carousel-hover-scale-target:1.036` の transition と drag 慣性 | 00-map §5 |
| P26 | スタートアップ/最前線 carousel 送りアニメ | 矢印 click 時の slide duration / easing（録画では未操作） | scroll-028 #10 |

---

## 4. 実装難易度メモ（React 19 + Tailwind 4 + Motion `motion/react`）

### 難度高（作り込み必須）

| 対象 | 方針 |
|---|---|
| **megamenu morph** | Radix 型を自作：単一の白背景 `div`（`navigation-menu__background` 相当）を Motion の `layout` アニメで trigger 間 morph、panel 内容は `AnimatePresence mode="popLayout"` で crossfade。open は `clip-path: inset()` か height を animate（scaleY は文字が歪むので不可、観測とも一致）。veil は fixed 白 overlay の opacity。header テーマ反転は `data-menu-open` 属性で Tailwind variant 切替（transition-colors 同 duration）。**panel 内容 DOM は実機 hover 状態を Playwright で別途取得しないと作れない**（00-map §3 の注意） |
| **GDP ticker / token odometer** | NumberFlow は不採用方針のため自作：桁別 `<span>` の縦 slot roll（outgoing/incoming 2 枚を `motion.span` で translateY、`tabular-nums` 必須）。GDP は ~1.3s 間隔 +1、token は数秒間隔でランダム目標へ複数桁 roll |
| **locale デモ auto-rotation** | scene state machine（JP/US/DE）+ `AnimatePresence` crossfade。phone → checkout → サマリーの順に `delay` で ~300ms stagger。hover と完全分離（独立 interval） |
| **squeezy carousel（§7）** | 本家は canvas 描画だが、**DOM ベース carousel で代替再現を推奨**（mobile fallback card が DOM にあるのでそれを基準に）。canvas 忠実再現はコスト過大 |

### 難度中

| 対象 | 方針 |
|---|---|
| hero gradient text | 本家どおり h1 二枚重ね：背景版（実色）+ 前景版（`bg-clip-text` + gradient、`aria-hidden`）。**hero 背景は DOM 上は静的 picture → まず静止画で実装し、P1 実測後に morph を判断**（WebGL 不要の可能性が高い＝Motion 縛りと整合） |
| logo marquee | li ×36（10 社ループ複製）を flex で並べ、rAF or CSS `animation: linear infinite` で translateX。等速・無停止・hover でも止めない |
| hover arrow（全 CTA 共通） | svg 2 path（軸線 + くの字）を 1 component 化。`group-hover` で軸線 opacity 0→1 + くの字 translateX ~1–2px、`transition: 200ms ease-out`。Tailwind のみで可 |
| expand icon ⤢ | `group-hover:bg-[#635BFF] group-hover:text-white`、`transition-colors duration-200`。カード本体は P5 実測まで動かさない |
| 構成図（§6a） | SVG `stroke-dasharray` + `stroke-dashoffset` を CSS animation で流す。logo flip は `rotateY` 180° の front/back 2 枚（`backface-visibility: hidden`） |
| stats 時間帯テーマ | gradient layer を重ねて opacity crossfade（`--active` class 切替）。combobox は headless |
| Zenflow widget build-in | `whileInView` + `staggerChildren`（Motion variants）。once: true |

### 難度低

| 対象 | 方針 |
|---|---|
| section entrance | **原則実装しない**（観測どおり即表示）。`lazy-animation--loaded` 相当は画像 lazy-load のみ |
| inline video（Hertz / Runway / §3 背景） | `<video autoplay muted loop playsinline>` + `prefers-reduced-motion` で poster 静止画 |
| nav siblings 退色 | nav コンテナ hover 時に非 hover 項目を `opacity-40`、`transition-opacity duration-200` |
| ボタン hover 色 | Tailwind transition-colors のみ |
| divider-canvas | canvas 不要、1px gradient line で代替 |
| 5b drag carousel | Motion の `drag="x"` + `dragConstraints`。hover scale 1.036 は `whileHover` |

### 共通ルール

- すべての常時アニメ（marquee / ticker / デモ / video）は `prefers-reduced-motion: reduce` で停止 or 静止画 fallback。
- duration token 化の提案：`--motion-hover: 200ms` / `--motion-menu-open: 450ms` / `--motion-panel-switch: 300ms`（P2 実測後に確定）/ `--motion-demo-fade: 500ms`。easing は hover = ease-out、menu = ease-out、panel 切替 = ease-in-out。

---

## 5. 矛盾の裁定記録

| 論点 | agent A | agent B | 裁定 |
|---|---|---|---|
| hero 背景の動き | scroll/hover 各 storyboard「常時 morph」 | DOM 分析「静的 picture・canvas 無し」 | 不一致 → **P1 へ**。実装は静止画スタートで安全側 |
| megamenu panel 切替 duration | hover-001「200–300ms」 | hover-030「350–500ms」 | 不一致 → **P2 へ**。暫定 token 300ms |
| bento カード hover の lift | hover-117/174「カード本体変化なし」（2 agent 一致） | DOM に `--card-shift-x/y` 等 | 録画 2 本一致を採用し「カード本体は動かさない」を暫定仕様、DOM 変数の実値は **P5 へ** |
| section entrance | scroll 3 本とも「なし」 | — | 一致 → 「entrance なし」を確定仕様として採用 |
| marquee 速度 | 16 / 25–30 / 30–60 / 40 px/s と散在 | — | 観測解像度差によるブレ → **P14 へ**。暫定 30px/s @720（≈60px/s @1440 ではなく viewport 比換算に注意） |
