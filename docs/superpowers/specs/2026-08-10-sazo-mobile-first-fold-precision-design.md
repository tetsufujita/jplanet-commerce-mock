# J-Planet モバイル first fold SAZO 精密再現設計

更新日: 2026-08-10
状態: 承認済み

## 目的

SAZOとJ-Planetで同じ `配送状況をLINEでお届け！` バナーを表示した比較画像を基準に、767px以下のモバイルホームfirst foldをさらに精密に再現する。

J-Planetのロゴ、ネイビー・桜色、5つのショートカット画像、AIエージェント遷移は維持する。今回変更するのはヘッダー、hero、検索欄、ショートカット領域の寸法・配置・表面表現だけである。

## 参照資料

- J-Planet現状: `/Users/fujitatetsu/Downloads/スクリーンショット 2026-08-10 16.12.46.png`
- SAZO基準: `/Users/fujitatetsu/Downloads/スクリーンショット 2026-08-10 16.12.42.png`
- 実装URL: `http://127.0.0.1:5190/sazo-commerce-mock/`
- 比較バナー: `public/sazo-commerce/hero/slide-1.webp`

## Design Audit

Preset: `mobile-first` + `ecommerce`

比較時点の主な差は次の4点である。

| 項目 | J-Planet現状 | SAZO基準 | 判定 |
|---|---:|---:|---|
| ヘッダー合計高 | 約122px | 約98px | J-Planetが約24px高い |
| hero比率 | 2.05:1 | 約2:1 | J-Planetが少し低い |
| 検索欄 | 52px・約48%重なり・左寄せ | 約48px・約60%重なり・中央揃え | 配置差が大きい |
| shortcut領域 | 上側が遅く、下余白が短い | icon開始が早く、区切り線まで深い | rhythmが異なる |

バナーassetは同一である。見かけ上の拡大差は主にヘッダー位置、hero高、検索欄の重なりによって生じているため、asset自体は変更しない。

## 決定

```text
J-Planetのブランド要素は維持
→ SAZOのfirst fold geometryを再現
→ 同一バナーでbefore/after比較
→ 商品領域・下部ナビ・デスクトップは変更しない
```

## 対象範囲

- 767px以下のhomeだけ
- モバイルprimary header
- モバイルsecondary navigation
- hero carousel viewport
- heroへ重なるAI検索欄
- 5項目shortcut row

## 非対象

- 768px以上のtablet/desktop
- 固定下部ナビ
- チャットボタン
- intro以降の商品・レビュー・特集構成
- 商品詳細、カート、決済、PRC
- hero画像asset、商品fixture、価格
- AIエージェントの内部UI・動作

## 1. ヘッダー

### Geometry

- 合計高: `98px`
- primary row: `56px`
- secondary navigation: `42px`
- contentの上paddingも `98px` と同期する
- collapsed home stateでも2段構成と同寸法を維持する

### Surface

- 白背景
- 下端だけ `16〜18px` の角丸
- SAZO基準と同程度の薄い下方向shadow
- heroは角丸headerの直下から開始し、隙間を作らない

### Branding and controls

- J-Planet wordmark幅は現行 `104px` を維持する
- 右側は言語、検索、カート
- iconの視覚寸法は現行から大きく変えない
- 言語flagの下に約18px幅、2px高の短いネイビー線を付ける
- secondary navigationは横scroll可能なまま
- `ホーム` は濃い桜色の文字と桜色下線で選択表示する
- homeを意図的に画面外へ隠さない

## 2. Hero carousel

- viewportとslideのaspect ratioを `2 / 1` にする
- 440px幅では高さ約220px
- 既存 `slide-1.webp` をそのまま使用する
- `delivery-line` と `large-furniture` の既存 `object-fit: fill` を維持する
- counter、pause/play、自動送り、reduced-motion対応を維持する
- counterとpause/playの位置・寸法は現行を維持し、hero geometryに追従させる

## 3. AI検索欄

- 高さ: `48px`
- 左右外margin: `12px`
- hero下端との重なり率: `0.60 ± 0.08`
- 実装上の目安: `margin-top: -29px`
- 白背景、pill角丸、薄いborderとshadow
- 検索iconは左から約20pxの位置に絶対配置する
- placeholder `何を注文しますか？` はpill全体に対して中央揃えする
- 最大font-size `16px`、weight `600` 程度
- 押すと既存 `open-agent` をdispatchし、既存AIエージェントdialogを開く

## 4. Shortcut row

- 5項目、1行、既存J-Planet artworkを維持する
- 検索欄下端からshortcut box上端まで約 `29〜32px`
- `.sazo-shortcuts` の上margin目安: `29px`
- icon寸法、ラベルfont、NEW badgeは現行維持
- shortcut boxの下paddingを約 `60px` にし、SAZO基準と同じ深い余白を作る
- shortcut領域下の区切り線位置を440px幅でcontent topから約 `505px ± 6px` に合わせる

## 5. 440px基準geometry

browser captureでは次の範囲を受け入れ条件とする。

| 要素 | 目標 |
|---|---:|
| header | `98px ± 2px` |
| hero top | `99px ± 2px` |
| hero height | `220px ± 2px` |
| search top | `288〜292px` |
| search height | `48px ± 1px` |
| search overlap ratio | `0.60 ± 0.08` |
| shortcuts top | `364〜371px` |
| intro top | `499〜511px` |

341pxと676pxでは固定pixel値を強制せず、同じ関係性を検証する。

```text
header bottom ≈ hero top
hero bottom - search top ≈ search height × 0.60
search bottom < shortcut top
shortcut bottom ≈ intro top
```

## 6. Accessibility

- controlの既存accessible nameを維持する
- search pillをbuttonとして維持する
- homeのselected文字色は白背景でWCAG AAを満たす濃い桜色を使う
- focus-visibleを削除しない
- 横navigationはkeyboardとtouch scrollの両方を維持する

## 7. Testing

### Unit

- 2段header、3操作、5 navigation項目を維持
- 検索欄が既存AI dialogを開く
- shortcutが5項目である

### Browser geometry

- 341px、440px、676pxでheader/hero/search/shortcut/introの順序と関係を検証
- 440pxでは表の目標値を検証
- search overlap ratioを検証
- headerのbottom radiusとshadowをcomputed styleで検証
- placeholder中央揃えとlanguage underlineをcomputed styleまたは専用class contractで検証
- document横overflowなし
- fixed bottom navigationが76pxのまま

### Regression

- 900px、1511pxがdesktopのまま
- lint、typecheck、227 unit tests、build、desktop/mobile E2E、capture、HTTP 200、`git diff --check`

## 受け入れ条件

1. 同じ `delivery-line` slideでSAZO基準と同じheader/hero/search/shortcutの縦rhythmになる。
2. header合計高が約98pxになり、下端角丸とshadowを持つ。
3. heroが2:1で同一asset全体を表示する。
4. 48pxの検索欄がheroへ約60%重なり、placeholderが中央に見える。
5. shortcut icon開始位置と区切り線位置がSAZO基準へ近づく。
6. J-Planetのlogo/colors/artwork、AI遷移、fixed bottom navは維持する。
7. 341px、440px、676pxで衝突・横overflowがない。
8. 768px以上、商品詳細、カート、決済に回帰がない。
