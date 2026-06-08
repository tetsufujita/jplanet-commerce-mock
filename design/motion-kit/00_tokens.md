# 00 motion tokens — 全 effect が従う唯一の規律

> これが一貫性＝premium の機械的担保。全 effect がこの token を参照する（バラバラ禁止）。`tailwind.config` / globals に定義。

## tokens
```
--ease-andes:   cubic-bezier(0.16, 1, 0.3, 1)   // 唯一の ease（docs/04 一致）。全 effect 共通
--dur-quick:    300ms   // hover / 小さい reveal
--dur-base:     500ms   // 入場 reveal / line draw
--dur-slow:     700ms   // hero stagger 全体感
--dur-count:    1200ms  // 数字 count / 長い line（上限）
--stagger:      70ms    // 行/要素の stagger 間隔
--rise:         12px    // 入場の translateY 振幅（小さく）
```

## 規律（機械判定可能・PASS 条件）
- **唯一 ease**: 上記 `--ease-andes` 以外を使ったら reject。
- **motion budget**: 動く"主役" section は最大 3（hero / 数字 / 2層）。1 viewport 内で同時に動く独立要素は 2 つまで。hover と入場 Reveal は主役にカウントしない。
- **reduced-motion 必達**: `prefers-reduced-motion: reduce` で全 effect が**静的終端へスナップ**（count=最終値・line=描画済・reveal=表示済）。Motion は `useReducedMotion()` で分岐。
- **性能**: アニメは `transform`/`opacity` 限定（`width/top/left` 禁止）。hero を LCP にしない。LCP<2.5s / CLS≈0。DPR≤2。
- **トリガ**: scroll-linked は **once 原則**。ループ・自動 carousel・cursor 追従は禁止。
- **色**: motion で使う色は Crimson のみ（pin-point）。背景動 gradient 全面 禁止。
