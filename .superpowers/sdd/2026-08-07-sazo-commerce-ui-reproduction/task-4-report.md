# Task 4 Report — SAZO Home, Discovery, and Hero Motion

## Status

完了。参照録画から切り出したローカル画像を使い、home の discovery セクション群、responsive carousel、5秒自動送り、pause / reduced-motion 制御を実装した。

## 実装内容

- `HomeView` に hero、shortcut、shop intro、口コミ、SAZO GRAM、高評価レビュー、SAZO's PICK、人気検索キーワード、SAZO RANKING、検索 discovery を参照順で実装した。
- `ProductCard` に 1:1 商品画像、brand、商品名、価格、discount / rank badge、お気に入り操作を実装した。
- `useSazoHero` に5秒ごとの自動送り、pause、unmount cleanup、`prefers-reduced-motion` 追従と listener cleanup を実装した。
- desktop は中央 active slide と左右 neighbor、mobile は edge-to-edge slide と horizontal card strip にした。画像比率は hero 2.45:1 / 1.62:1、product 1:1、community 0.78:1。
- stateful な `HomeView` は responsive shell 全体で1回だけ mount し、CSS で desktop / mobile の shell landmark と同居させた。
- home で必要な固定日本語ラベルを `ja / en / pt-BR` の同一 i18n namespace に追加し、録画から読めた fixture 商品・レビュー・ランキング文字列へ更新した。

## Visual assets

- 作成数: hero 5枚、product 12枚、community 6枚、logo SVG 1枚。
- 元画像は承認済み desktop / mobile MOV から FFmpeg で指定フレームを抽出・crop した。Homebrew FFmpeg 8.0.1 に WebP encoder がないため、最終 WebP encode のみ Pillow 12.1.1 を使い、brief 指定の quality 88 / method 6 で保存した。
- hero は desktop の active banner crop を基本とし、desktop で active 状態を取得できなかった LINE banner だけ mobile frame を使用した。
- product は desktop 24秒・28秒・32秒、community は desktop 13秒・14秒の表示領域から crop した。
- 最大ファイルは `hero/slide-2.webp` の 41,226 bytes。`find public/sazo-commerce -type f -size +350k -print` は無出力。
- ignored QA reference PNG は変更していない。

## TDD evidence

### RED

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx
```

- `HomeView` 実装前に実行し、`@/sazo-commerce/HomeView` が存在しない期待どおりの missing-module failure を確認した。

### GREEN

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
```

- PASS — 2 files / 17 tests。
- section order、captured labels、single mount、previous / next / wrap / pause、5秒 interval、unmount cleanup、reduced-motion 抑止を observable DOM / timer behavior で検証した。

## Verification

| Command                   | Result                           |
| ------------------------- | -------------------------------- |
| focused Vitest            | PASS — 2 files / 17 tests        |
| `pnpm typecheck`          | PASS                             |
| `pnpm lint`               | PASS                             |
| `pnpm test`               | PASS — 7 files / 45 tests        |
| `pnpm build`              | PASS — 2,207 modules transformed |
| scoped `prettier --check` | PASS                             |
| `git diff --check`        | PASS                             |
| locale JSON parse         | PASS                             |
| asset size check          | PASS — 350 KB超過なし            |

## Visual QA

- Chrome で `/sazo-commerce-mock/` を 1511×828 と 390×844 で描画した。
- desktop で active / neighbor hero、1/5、前後操作、shortcut row、grid、footer まで確認した。
- mobile で edge-to-edge hero、hero search、horizontal strips、fixed bottom navigation、全セクション順を確認した。
- 参照動画に焼き込まれた slide 2–5 の counter artwork と live control の二重描画は、実 control を同位置の透明 hit target として残して解消した。初期 slide 1 は焼き込みのない crop と live `1/5` control を表示する。

## Self-review

- public component / hook は named export、内部 import は `@/`、state/action は既存 Task 2 type を使用した。
- `any`、console、floating promise、global CSS selector は追加していない。
- hero timer と media-query listener はそれぞれ cleanup し、pause / reduced-motion 中は interval を作らない。
- 画像はローカル path のみで、全 delivery name、dimensions、件数、350 KB制限を照合した。
- shortcut landmark は shell の primary navigation と競合しない `role="group"` にして、既存 shell landmark contract を維持した。

## Concerns

- LINE hero は desktop active frame が参照録画に残っていないため、mobile frame の crop を desktop にも使用しており、他の4枚より文字の解像感が低い。
- slide 2–5 の pause artwork は録画画像に含まれるため、pause state に切り替えても絵柄自体は play icon へ変わらない。実ボタンの accessible name と timer state は正しく切り替わる。

## Fix Round 1

### 対応内容

- slide 2–5 を元cropの中央content領域から再構成し、録画に焼き込まれていた counter、pause、左右arrow、pink cursorを全てdelivery assetから除去した。hero上の操作表示はactive slideに重なるDOM live UIだけになった。
- slide 2–5でlive statusを`opacity: 0`にしていたCSSを削除した。pause buttonは全slideで可視・keyboard focus可能になり、DOM iconとaccessible nameがpause / play stateに同期する。
- hero offsetを単純な`index - activeIndex`から5枚のmodular shortest-distanceへ変更した。1/5では5・1・2、5/5では4・5・1が連続slotとなり、5→1 / 1→5はいずれも1slot移動する。
- `homeReviews`、`homeGramEntries`、`reviewRecommendations`をtyped fixtureとして明示した。homeは口コミに`community/04–06`、GRAMに`community/01–03`を使用し、recommendationは録画14秒の専用product cropへ結び付けた。review IDの文字置換によるproduct探索は削除した。
- 1200×490 heroをmobileで`fill`していたCSSを廃止した。各slideに元frameからresizeなしで切り出した約1.62:1のmobile cropを追加し、`picture/source`で配信、computed `object-fit`は`cover`に統一した。
- 実Chrome検証用`pnpm test:sazo-home-browser`を追加した。live status opacity、keyboard Tab focus ring、pause/play切替、wrap時の実bounding-box移動、mobile current source・natural dimensions・computed ratioを検証する。

### TDD RED

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx
pnpm test:sazo-home-browser
```

- unit: 9件中3件が期待どおりFAIL。口コミが6枚の混在assetを表示、heroにcircular offset contractなし、mobile `source`が0件だった。
- real browser: slide 2へ進めた後の`.sazo-hero-status` computed opacityが`0`でFAILし、live controlが視覚・focus表示から消える回帰を再現した。

### TDD GREEN

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm test:sazo-home-browser
```

- focused unit: PASS — 2 files / 21 tests。
- Chrome behavior: PASS — `sazo-home-browser-ok`。

### Verification

| Command                       | Result                           |
| ----------------------------- | -------------------------------- |
| `pnpm test:sazo-home-browser` | PASS                             |
| focused Vitest                | PASS — 2 files / 21 tests        |
| `pnpm test`                   | PASS — 7 files / 49 tests        |
| `pnpm typecheck`              | PASS                             |
| `pnpm lint`                   | PASS                             |
| `pnpm build`                  | PASS — 2,207 modules transformed |
| asset contract / 350 KB check | PASS — 最大42,164 bytes          |
| `git diff --check`            | PASS                             |

### Visual QA / self-review

- Chrome 1511×828のslide 2で、asset内操作物・cursorがなく、DOMの`2/5`、pause icon、pink focus ringだけが表示されることを確認した。左右neighborにも固有の焼き込みcontrolはない。
- Chrome 390×844でmobile sourceのnatural/display ratioがともに約1.62、`object-fit: cover`であることを確認した。
- home全体で口コミ3枚、GRAM 3枚、recommendation 2枚のassetと文字データが各source checkpointどおり対応することを確認した。
- 旧報告の「transparent hit target」と「pause artworkが切り替わらない」懸念は解消した。LINE heroがmobile録画crop由来で他slideより低解像度という既存制約だけが残る。

## Fix Round 2

### 対応内容

- 5枚heroのうちoffset `-2 / 2`を常時`opacity: 0`、`pointer-events: none`、`transition: none`にした。wrap時に遠方slideが反対側へ横断するghostを除き、transition対象をoffset `-1 / 0 / 1`の3枚だけに限定した。
- desktop録画13秒の口コミを6件すべて再取得し、`mm / なー / T / 村上ラッペ / 코코 / 17♡`の表示順と固有画像を復元した。
- 公開`reviews` 8件、`gramEntries` 6件を固有の本文・画像へ置き換えた。home subsetは`homeReviewIds`と`homeGramEntryIds`のtyped ID配列から明示的に選択し、TSX側の文字列推論を使わないfixture contractにした。
- community assetを`07–14.webp`まで追加した。全8枚は390×500、最大34,690 bytesで、既存を含むcommunity 14枚のSHA-1はすべて一意だった。

### TDD RED

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm test:sazo-home-browser
```

- focused unit: 2件が期待どおりFAIL。home口コミが3件のままで6件のasset順を満たさず、公開口コミfixtureの実質一意件数が3件だった。
- Chrome behavior: 5→1切替45ms時点で5枚すべてのcomputed opacityが可視となり、期待する3枚だけの集合に一致せずFAILした。

### TDD GREEN

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm test:sazo-home-browser
```

- focused unit: PASS — 2 files / 23 tests。
- Chrome behavior: PASS — 5→1と1→5の両方向で、切替45ms時点の可視slideが3枚だけ、遠方2枚のcomputed styleが`opacity: 0 / pointer-events: none / transition-duration: 0s`であることを確認した。

### Verification

| Command                       | Result                               |
| ----------------------------- | ------------------------------------ |
| `pnpm test:sazo-home-browser` | PASS — `sazo-home-browser-ok`        |
| focused Vitest                | PASS — 2 files / 23 tests            |
| `pnpm test`                   | PASS — 7 files / 51 tests            |
| `pnpm typecheck`              | PASS                                 |
| `pnpm lint`                   | PASS                                 |
| `pnpm build`                  | PASS — 2,207 modules transformed     |
| asset dimensions              | PASS — 新規8枚すべて390×500          |
| asset uniqueness / 350 KB     | PASS — community 14枚固有 / 超過なし |
| `git diff --check`            | PASS                                 |

### Concerns

- LINE heroがmobile録画crop由来で、他4枚より文字の解像感が低い既存制約は残る。
- 公開review追加2件とGRAM追加3件は別checkpointの録画cropを使用している。元サイト更新後の永続的なfixture IDではなく、今回の承認済み録画に対する再現用fixtureである。
