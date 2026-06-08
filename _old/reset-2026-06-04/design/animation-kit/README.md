# animation-kit — Codex 引き出し用（実体 DL 済）

> `docs/09_animation-stack.md` の確定スタックのうち、**コピペ系コンポーネントの実体をここに DL 済**。
> Codex はここから `src/` にコピーして使う。npm 系（gsap / lenis / drei 等）はライブラリ install なのでここには無い → 下の install 表参照。
> 取得元: magicui.design registry（`https://magicui.design/r/<name>.json`）2026-06-02 取得・**MIT**。

## 入ってるもの（実体・MIT・Magic UI）

| ファイル | 用途（docs/09 の判定） | 依存 | コピー先（推奨） |
|---|---|---|---|
| `components/animated-beam.tsx` | **agent 抽象図**＝ノード間を光点が流れる（✅本命） | framer-motion, cx | `src/components/motion/` |
| `components/number-ticker.tsx` | 数字カウント（既存 `motion/CountUp.tsx` / `@number-flow/react` の代替案） | framer-motion, cx | `src/components/motion/` |
| `components/particles.tsx` | 粒子背景（△任意） | cx のみ | `src/components/motion/` |

## ⚠ このプロジェクト向け 適合手順（コピー時に 2 置換）

DL 直後のファイルは Magic UI 既定の import。Andes の規約に合わせて **2 箇所だけ置換**すれば動く:

1. `import { cn } from "@/lib/utils"` → **`import { cx } from "@/lib/classnames"`**、本文の `cn(` → `cx(`
2. `from "motion/react"` → **`from "framer-motion"`**（既導入。`motion` パッケージ追加は不要）

→ **この 2 置換だけで新規 npm 依存ゼロで動く**（`cx` も `framer-motion` も既存）。

補足: `cx` は単純結合で tailwind-merge の競合解決は無い。variant の class 上書きを厳密にしたい場合のみ、任意で本物の `cn` を入れる:
```bash
pnpm add clsx tailwind-merge
```
```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

## npm 系（ここには無い・install で入れる）

| 区分 | パッケージ | メモ |
|---|---|---|
| ✅ 既導入 | `gsap` `@gsap/react` `lenis` `@react-three/drei` `@react-three/fiber` `three` `framer-motion` `split-type` | そのまま import |
| ➕ 新規(推奨) | `@number-flow/react` | 4 マクロ数字の odometer。`pnpm add @number-flow/react` |
| ⚖ 新規(試作) | `three-fluid-fx` | hero 流体・第一候補。`pnpm add three-fluid-fx` → 試作仕様は docs/09「Hero 流体 試作仕様」 |

## 関連
- 判定 / URL / 理由 の正典 = **`docs/09_animation-stack.md`**
- hero 流体の試作仕様 = `docs/09` 内「Hero 流体 試作仕様」
