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

| Command | Result |
| --- | --- |
| focused Vitest | PASS — 2 files / 17 tests |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm test` | PASS — 7 files / 45 tests |
| `pnpm build` | PASS — 2,207 modules transformed |
| scoped `prettier --check` | PASS |
| `git diff --check` | PASS |
| locale JSON parse | PASS |
| asset size check | PASS — 350 KB超過なし |

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
